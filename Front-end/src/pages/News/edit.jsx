import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Skeleton,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import * as cheerio from "cheerio";
import TinnyMce from "../../components/UI/authComponent/tinnyMce";
import { shareServices } from "../../components/services/shareServices";
import { newsServices } from "../../components/services/newsServices";
import SpinComponent from "../../components/UI/spin";

const { Title, Text } = Typography;
const { TextArea } = Input;

function EditNews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Thumbnail: uid='existing' = ảnh từ DB chưa đổi, originFileObj = file mới
  const [thumbFileList, setThumbFileList] = useState([]);
  // Lưu dữ liệu thumbnail gốc từ DB { url, public_id }
  const existingThumbRef = useRef(null);
  // Lưu contentImages gốc từ DB [{ url, public_id }]
  const existingContentImagesRef = useRef([]);

  // Key lưu ảnh TinyMCE pending trong localStorage (riêng theo ID bài)
  const PENDING_KEY = `news_edit_pending_${id}`;
  const getPending = () => JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
  const addPending = (img) =>
    localStorage.setItem(PENDING_KEY, JSON.stringify([...getPending(), img]));
  const clearPending = () => localStorage.removeItem(PENDING_KEY);

  // Load bài viết khi mount
  useEffect(() => {
    newsServices
      .getNewsById(id)
      .then((res) => {
        const n = res.news;
        form.setFieldsValue({
          title: n.title,
          summary: n.summary,
          content: n.content,
        });

        existingThumbRef.current = n.thumbnail || null;
        existingContentImagesRef.current = n.contentImages || [];

        if (n.thumbnail?.url) {
          setThumbFileList([
            {
              uid: "existing",
              name: "thumbnail",
              status: "done",
              url: n.thumbnail.url,
              thumbUrl: n.thumbnail.url,
            },
          ]);
        }

        // Cleanup ảnh pending bị bỏ sót từ phiên edit trước
        const leftover = getPending();
        if (leftover.length > 0) {
          shareServices
            .deleteImages(leftover.map((img) => img.public_id))
            .catch(console.error)
            .finally(() => clearPending());
        }
      })
      .catch(() => {
        message.error("Không thể tải bài viết");
        navigate("/news");
      })
      .finally(() => setPageLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUploaded = useCallback((imgData) => {
    addPending(imgData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    const pending = getPending();

    // Parse nội dung để tìm URL ảnh đang dùng
    const $ = cheerio.load(values.content || "");
    const usedUrls = new Set();
    $("img").each((_, el) => {
      const src = $(el).attr("src");
      if (src) usedUrls.add(src);
    });

    // Phân loại pending (ảnh mới upload trong phiên này)
    const usedPending = pending.filter((img) => usedUrls.has(img.url));
    const orphanIds = pending
      .filter((img) => !usedUrls.has(img.url))
      .map((img) => img.public_id);

    // contentImages còn dùng = ảnh gốc từ DB còn trong content + pending còn dùng
    const existingUsed = existingContentImagesRef.current.filter((img) =>
      usedUrls.has(img.url)
    );
    const finalContentImages = [...existingUsed, ...usedPending];

    // Xử lý thumbnail
    let finalThumbnail = existingThumbRef.current; // mặc định: giữ nguyên
    const firstThumb = thumbFileList[0];

    if (!firstThumb) {
      // User đã xóa thumbnail
      finalThumbnail = null;
    } else if (firstThumb.originFileObj) {
      // User chọn thumbnail mới → upload lên Cloudinary
      const formData = new FormData();
      formData.append("files", firstThumb.originFileObj);
      try {
        const uploadRes = await shareServices.postUploadImage(formData);
        finalThumbnail = uploadRes?.data?.[0];
        if (!finalThumbnail) throw new Error("Upload thumbnail thất bại");
      } catch {
        message.error("Upload ảnh đại diện thất bại, vui lòng thử lại.");
        setLoading(false);
        return;
      }
    }
    // Nếu firstThumb.uid === 'existing' → giữ nguyên existingThumbRef.current

    // Xóa ảnh TinyMCE orphan
    if (orphanIds.length > 0) {
      await shareServices.deleteImages(orphanIds).catch(console.error);
    }
    clearPending();

    try {
      await newsServices.updateNews(id, {
        title: values.title,
        summary: values.summary,
        content: values.content,
        thumbnail: finalThumbnail,
        contentImages: finalContentImages,
      });

      message.success("Cập nhật bài viết thành công!");
      navigate("/news");
    } catch (error) {
      if (error.response?.status === 400) {
        const mod = error.response.data?.news?.moderation;
        Modal.warning({
          title: "Nội dung bị từ chối bởi hệ thống kiểm duyệt AI",
          content: mod ? (
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
                Bài viết đã được lưu với trạng thái "Bị từ chối".
              </p>
            </div>
          ) : (
            "Nội dung vi phạm tiêu chuẩn cộng đồng."
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
        title: "Hủy chỉnh sửa?",
        content: `Có ${pending.length} ảnh mới bạn đã tải lên sẽ bị xóa khỏi hệ thống.`,
        okText: "Xác nhận hủy",
        cancelText: "Tiếp tục chỉnh sửa",
        okButtonProps: { danger: true },
        onOk: async () => {
          await shareServices
            .deleteImages(pending.map((img) => img.public_id))
            .catch(console.error);
          clearPending();
          navigate(-1);
        },
      });
    } else {
      navigate(-1);
    }
  };

  if (pageLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <>
      {loading && <SpinComponent content="Đang đợi AI kiểm duyệt bài viết..." />}
      {!loading && (
        <div className="product-form-wrapper">
          <style>{`
            .product-form-wrapper { background-color: #f0f2f5; min-height: 100vh; padding: 24px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .custom-card { margin-bottom: 24px; border-radius: 8px; }
            .thumb-remove-btn { position: absolute; top: 4px; right: 4px; z-index: 10; }
          `}</style>

          <div className="container">
            <div className="page-header">
              <div>
                <Title level={2}>Chỉnh Sửa Bài Viết</Title>
                <Text type="secondary">Cập nhật nội dung bài viết</Text>
              </div>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => form.submit()}
                >
                  Lưu thay đổi
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
                      <Input size="large" />
                    </Form.Item>

                    <Form.Item
                      name="summary"
                      label="Tóm tắt ngắn"
                      rules={[{ required: true, message: "Vui lòng nhập tóm tắt" }]}
                    >
                      <TextArea rows={4} showCount maxLength={300} />
                    </Form.Item>
                  </Card>
                </Col>

                {/* CỘT PHẢI — Thumbnail */}
                <Col xs={24} lg={8}>
                  <Card
                    title={
                      <>
                        <PictureOutlined /> Ảnh đại diện
                      </>
                    }
                    className="custom-card"
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      fileList={thumbFileList}
                      beforeUpload={() => false}
                      accept="image/*"
                      onChange={({ fileList }) => setThumbFileList(fileList)}
                      onRemove={() => {
                        setThumbFileList([]);
                        return false;
                      }}
                      itemRender={(originNode, file) => {
                        // Nút xóa ảnh gốc (uid='existing') hiển thị rõ ràng hơn
                        if (file.uid === "existing") {
                          return (
                            <div style={{ position: "relative", display: "inline-block" }}>
                              <img
                                src={file.url}
                                alt="thumbnail"
                                style={{
                                  width: 86,
                                  height: 86,
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  border: "1px solid #d9d9d9",
                                }}
                              />
                              <Button
                                className="thumb-remove-btn"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => setThumbFileList([])}
                              />
                            </div>
                          );
                        }
                        return originNode;
                      }}
                    >
                      {thumbFileList.length === 0 && (
                        <div>
                          <PictureOutlined />
                          <div style={{ marginTop: 8 }}>Tải ảnh mới</div>
                        </div>
                      )}
                    </Upload>

                    <Text type="secondary" style={{ fontSize: 12 }}>
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
                      rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                    >
                      <TinnyMce onImageUploaded={handleImageUploaded} />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}

export default EditNews;
