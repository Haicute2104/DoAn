import { useState, useEffect } from "react";
import {
  FolderOpenOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import {
  Card,
  Table,
  Typography,
  Button,
  Input,
  Image,
  Tooltip,
  Tag,
  Popover,
  Modal,
  Space,
  message,
  Form, 
} from "antd";
import { useNavigate } from "react-router-dom";
import { newsServices } from "../../components/services/newsServices";
import DeleteNews from "./delete";

const { Title, Text } = Typography;

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Khởi tạo form instance
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await newsServices.getAllNews();
      setNews(res.news || []);
    } catch (error) {
      message.error("Lấy danh sách bài viết thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi form submit thành công
  const onFinishReview = async (values) => {
    setSubmitting(true);
    const result = await newsServices.changeStatus(selectedRecord?._id, {
      status: "published",
      review: values.review, 
    });
    setSubmitting(false);

    if (result.success) {
      message.success(result.message);
      fetchNews();
      setOpenModal(false);
      form.resetFields(); 
    } else {
      message.error(result.message);
    }
  };

  const columns = [
    {
      title: "Tiêu đề bài viết",
      dataIndex: "title",
      align: "center",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      align: "center",
      width: 120,
      render: (thumbnail) =>
        thumbnail?.url ? (
          <Image
            src={thumbnail.url}
            width={60}
            height={40}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <PictureOutlined style={{ fontSize: 18, color: "#ccc" }} />
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "150px",
      align: "center",
      render: (status, record) => {
        const moderation = record.moderation || {};
        const statusMap = {
          pending_review: { color: "processing", text: "Chờ duyệt" },
          published: { color: "success", text: "Đã duyệt" },
          rejected: { color: "error", text: "Từ chối" },
        };
        const currentStatus = statusMap[status] || {
          color: "default",
          text: "Không rõ",
        };
        const latestReview = record.reviewHistory?.length
          ? record.reviewHistory[record.reviewHistory.length - 1]
          : null;

        const content =
          status === "rejected" || status === "published" ? (
            <div>
              <p>Lý do: {moderation.reason || "Không phát hiện vi phạm"}</p>
              <p>Điểm: {moderation.score ?? 0}</p>
              <p>
                Danh mục:{" "}
                {moderation.categories?.length
                  ? moderation.categories.join(", ")
                  : "Không có"}
              </p>
              <p>
                Ngày kiểm duyệt:{" "}
                {record.updatedAt
                  ? new Date(record.updatedAt).toLocaleDateString("vi-VN")
                  : "Chưa có"}
              </p>
              {status === "published" && latestReview && (
                <p>
                  <Text strong>Người duyệt:</Text> {latestReview.actor}
                  {latestReview.review && (
                    <> — <Text type="secondary">{latestReview.review}</Text></>
                  )}
                </p>
              )}
            </div>
          ) : (
            <Text type="secondary">Chưa có dữ liệu kiểm duyệt</Text>
          );
        const isClickable = status === "pending_review" || status === "rejected";
        
        return (
          <Popover
            title="Thông tin kiểm duyệt"
            content={content}
            trigger="hover"
          >
            <Tag
              color={currentStatus.color}
              style={{
                cursor: isClickable ? "pointer" : "default",
                opacity: isClickable ? 1 : 0.8,
              }}
              onClick={() => {
                if (isClickable) {
                  setSelectedRecord(record); 
                  form.resetFields(); 
                  setOpenModal(true);
                }
              }}
            >
              {currentStatus.text}
            </Tag>
          </Popover>
        );
      },
    },
    {
      title: "Lượt xem",
      dataIndex: "viewCount",
      align: "center",
      render: (view) => view || 0,
    },
    {
      title: "Ngày đăng",
      dataIndex: "publishedAt",
      align: "center",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa đăng",
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => navigate(`/news/edit/${record._id}`)}
            />
          </Tooltip>

          <DeleteNews record={record} refresh={fetchNews} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Space>
            <FolderOpenOutlined style={{ fontSize: 22 }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý bài viết
              </Title>
              <Text type="secondary">Danh sách bài viết trong hệ thống</Text>
            </div>
          </Space>

          <Space>
            <Input
              placeholder="Tìm kiếm tiêu đề..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 250 }}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/news/create")}
            >
              Thêm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={
            keyword
              ? news.filter((item) =>
                  item.title?.toLowerCase().includes(keyword.toLowerCase())
                )
              : news
          }
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`Kiểm duyệt: ${selectedRecord?.title || ""}`}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={[
          <Button key="close" onClick={() => setOpenModal(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            form="reviewForm"
            htmlType="submit"
          >
            Duyệt bài
          </Button>,
        ]}
      >
        <Form
          id="reviewForm"
          form={form}
          layout="vertical"
          onFinish={onFinishReview} 
        >
          <Form.Item
            name="review"
            label={<Text strong>Ghi chú kiểm duyệt</Text>}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default News;