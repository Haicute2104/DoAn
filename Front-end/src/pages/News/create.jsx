import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  Card,
  Row,
  Col,
  Typography,
  Space,
  message,
  Modal,
} from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import * as cheerio from "cheerio";
import TinnyMce from "../../components/UI/authComponent/tinnyMce";
import { shareServices } from "../../components/services/shareServices";
import { newsServices } from "../../components/services/newsServices";
import SpinComponent from "../../components/UI/spin";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Key lưu ảnh TinyMCE đang pending trong localStorage
const PENDING_KEY = "news_create_pending_images";

const getPending = () => JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
const addPending = (img) =>
  localStorage.setItem(PENDING_KEY, JSON.stringify([...getPending(), img]));
const clearPending = () => localStorage.removeItem(PENDING_KEY);

function CreateNews() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Mount: cleanup ảnh bị bỏ sót từ phiên trước
   * (reload trang / đóng tab mà chưa submit)
   */
  useEffect(() => {
    const leftover = getPending();
    if (leftover.length > 0) {
      shareServices
        .deleteImages(leftover.map((img) => img.public_id))
        .catch(console.error)
        .finally(() => clearPending());
    }
  }, []);

  // Cảnh báo khi đóng tab / refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (getPending().length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Cleanup khi navigate trong app mà chưa submit
  useEffect(() => {
    return () => {
      const pending = getPending();
      if (pending.length > 0) {
        shareServices
          .deleteImages(pending.map((img) => img.public_id))
          .catch(console.error);
        clearPending();
      }
    };
  }, []);

  // TinyMCE gọi callback này sau mỗi lần upload ảnh thành công
  const handleImageUploaded = useCallback((imgData) => {
    addPending(imgData); // { url, public_id }
  }, []);

  const onFinish = async (values) => {
    setLoading(true);

    // Đọc pending images trước khi bắt đầu (tránh race condition)
    const pending = getPending();

    // Parse HTML content → tìm URL ảnh thực sự đang dùng trong editor
    const $ = cheerio.load(values.content || "");
    const usedUrls = new Set();
    $("img").each((_, el) => {
      const src = $(el).attr("src");
      if (src) usedUrls.add(src);
    });

    const usedImages = pending.filter((img) => usedUrls.has(img.url));
    const orphanIds = pending
      .filter((img) => !usedUrls.has(img.url))
      .map((img) => img.public_id);

    // Hàm cleanup dùng chung cho cả success và AI-rejected
    const cleanup = async () => {
      if (orphanIds.length > 0) {
        await shareServices.deleteImages(orphanIds).catch(console.error);
      }
      clearPending();
    };

    try {
      // 1. Upload thumbnail lên Cloudinary trước
      let thumbnail = null;
      const thumbFile = values.thumbnail?.[0]?.originFileObj;
      if (thumbFile) {
        const formData = new FormData();
        formData.append("files", thumbFile);
        const uploadRes = await shareServices.postUploadImage(formData);
        thumbnail = uploadRes?.data?.[0]; // { url, public_id }
        if (!thumbnail) throw new Error("Upload thumbnail thất bại");
      }

      // 2. Gửi lên server tạo bài viết
      await newsServices.createNews({
        title: values.title,
        summary: values.summary,
        content: values.content,
        thumbnail,
        contentImages: usedImages, // [{ url, public_id }] → backend lưu vào DB
      });

      // 3. Xóa orphan images + clear localStorage
      await cleanup();

      message.success("Đăng bài viết thành công!");
      navigate("/news");
    } catch (error) {
      // Backend trả 400 khi AI từ chối nội dung
      if (error.response?.status === 400 && error.response?.data?.news) {
        await cleanup();
        const mod = error.response.data.news?.moderation;
        Modal.warning({
          title: "Bài viết bị từ chối bởi hệ thống kiểm duyệt AI",
          content: (
            <div>
              <p>
                <b>Lý do:</b> {mod.reason}
              </p>
              {mod.categories?.length > 0 && (
                <p>
                  <b>Danh mục vi phạm:</b> {mod.categories.join(", ")}
                </p>
              )}
              <p style={{ color: "#888", fontSize: 12 }}>
                Bài viết đã được lưu với trạng thái "Bị từ chối". Bạn có thể
                chỉnh sửa lại từ danh sách bài viết.
              </p>
            </div>
          ),
          onOk: () => navigate("/news"),
        });
      } else {
        console.error(error);
        message.error("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const pending = getPending();
    if (pending.length > 0) {
      Modal.confirm({
        title: "Hủy tạo bài viết?",
        content: `Có ${pending.length} ảnh bạn đã tải lên sẽ bị xóa khỏi hệ thống.`,
        okText: "Xác nhận hủy",
        cancelText: "Tiếp tục chỉnh sửa",
        okButtonProps: { danger: true },
        onOk: async () => {
          await shareServices.deleteImages(pending.map((img) => img.public_id));
          clearPending();
          navigate(-1);
        },
      });
    } else {
      navigate(-1);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  return (
    <>
    {loading && (
    <SpinComponent content="Đang đợi AI kiểm duyệt bài viết..." />
    )}
    {!loading && (<>
    <div className="product-form-wrapper">

      <style>{`
        .product-form-wrapper { background-color: #f0f2f5; min-height: 100vh; padding: 24px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .custom-card { margin-bottom: 24px; border-radius: 8px; }
        .btn-save { background-color: #1890ff; }
      `}</style>

      <div className="container">
        <div className="page-header">
          <div>
            <Title level={2}>Thêm Bài Viết Mới</Title>
            <Text type="secondary">
              Tạo nội dung mới cho Blog hoặc Tin tức hệ thống
            </Text>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Quay lại
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              className="btn-save"
            >
              Đăng bài viết
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Row gutter={24}>
            {/* CỘT TRÁI */}
            <Col xs={24} lg={16}>
              <Card
                title={
                  <>
                    <FileTextOutlined /> Thông tin bài viết
                  </>
                }
                className="custom-card"
              >
                <Form.Item
                  name="title"
                  label="Tiêu đề bài viết"
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                  <Input
                    placeholder="Ví dụ: Xu hướng thời trang 2026..."
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="summary"
                  label="Tóm tắt ngắn"
                  rules={[{ required: true, message: "Vui lòng nhập tóm tắt" }]}
                >
                  <TextArea
                    rows={4}
                    showCount
                    maxLength={300}
                    placeholder="Mô tả ngắn gọn về bài viết để thu hút người đọc..."
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* CỘT PHẢI */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <>
                    <PictureOutlined /> Ảnh đại diện
                  </>
                }
                className="custom-card"
                
              >
                <Form.Item
                  name="thumbnail"
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    {uploadButton}
                  </Upload>
                </Form.Item>

                <Text type="secondary" style={{ fontSize: "12px" }}>
                  * Nên chọn ảnh tỉ lệ 16:9 để hiển thị đẹp nhất.
                </Text>
              </Card>
            </Col>
          </Row>

          {/* CONTENT FULL WIDTH */}
          <Row>
            <Col span={24}>
              <Card
                title={
                  <>
                    <FileTextOutlined /> Nội dung chi tiết
                  </>
                }
                className="custom-card"
              >
                <Form.Item
                  name="content"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung" },
                  ]}
                >
                  <TinnyMce onImageUploaded={handleImageUploaded} />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
    </>
    )}
    </>
  );
}

export default CreateNews;
