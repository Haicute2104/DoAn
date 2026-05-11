import {
  Drawer,
  Descriptions,
  Avatar,
  Tag,
  Spin,
  Divider,
  Typography,
  Space,
  Empty,
  Table,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ORDER_STATUS_MAP = {
  pending: { label: "Chờ xác nhận", color: "orange" },
  confirmed: { label: "Đã xác nhận", color: "blue" },
  shipped: { label: "Đang giao", color: "cyan" },
  delivered: { label: "Đã giao", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

const PAYMENT_STATUS_MAP = {
  unpaid: { label: "Chưa thanh toán", color: "default" },
  paid: { label: "Đã thanh toán", color: "green" },
  failed: { label: "Thất bại", color: "red" },
  refunded: { label: "Đã hoàn tiền", color: "purple" },
};

function UserDetailDrawer({ open, onClose, user, loading }) {
  const getStatusTag = () => {
    if (!user) return null;
    if (user.isBanned) return <Tag color="red">Bị khóa</Tag>;
    if (!user.isActive) return <Tag color="default">Chưa kích hoạt</Tag>;
    return <Tag color="green">Hoạt động</Tag>;
  };

  const getGenderIcon = (gender) => {
    if (gender === "Nam") return <ManOutlined style={{ color: "#1890ff" }} />;
    if (gender === "Nữ") return <WomanOutlined style={{ color: "#eb2f96" }} />;
    return null;
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 160,
      render: (text) => (
        <Text copyable style={{ fontSize: 12 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (val) => <Text strong>{formatCurrency(val)}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const mapped = ORDER_STATUS_MAP[status] || {
          label: status,
          color: "default",
        };
        return <Tag color={mapped.color}>{mapped.label}</Tag>;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 130,
      render: (status) => {
        const mapped = PAYMENT_STATUS_MAP[status] || {
          label: status,
          color: "default",
        };
        return <Tag color={mapped.color}>{mapped.label}</Tag>;
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
  ];

  return (
    <Drawer
      title="Chi tiết tài khoản người dùng"
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
      destroyOnHidden
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Đang tải..." fullscreen />
        </div>
      ) : !user ? (
        <Empty description="Không có dữ liệu" />
      ) : (
        <>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Avatar
              size={80}
              src={user.avatarUrl}
              icon={<UserOutlined />}
              style={{ marginBottom: 12 }}
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {user.fullName}
              </Title>
              <Space style={{ marginTop: 8 }}>{getStatusTag()}</Space>
            </div>
          </div>

          <Divider />

          {/* Thong tin ca nhan */}
          <Title level={5}>Thông tin cá nhân</Title>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item
              label={
                <span>
                  <MailOutlined style={{ marginRight: 6 }} />
                  Email
                </span>
              }
            >
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <PhoneOutlined style={{ marginRight: 6 }} />
                  Số điện thoại
                </span>
              }
            >
              {user.phone || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  {getGenderIcon(user.gender)}
                  <span style={{ marginLeft: user.gender ? 6 : 0 }}>
                    Giới tính
                  </span>
                </span>
              }
            >
              {user.gender || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  Ngày sinh
                </span>
              }
            >
              {user.dateOfBirth
                ? dayjs(user.dateOfBirth).format("DD/MM/YYYY")
                : "Chưa cập nhật"}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Thong ke */}
          <Title level={5}>Thống kê mua hàng</Title>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <StatCard
              icon={<ShoppingCartOutlined />}
              label="Tổng đơn hàng"
              value={user.totalOrder ?? 0}
              color="#1890ff"
            />
            <StatCard
              icon={<DollarOutlined />}
              label="Tổng chi tiêu"
              value={formatCurrency(user.totalPrice)}
              color="#52c41a"
            />
            <StatCard
              icon={<CloseCircleOutlined />}
              label="Đơn đã hủy"
              value={user.totalCancelOrder ?? 0}
              color="#ff4d4f"
            />
          </div>

          <Divider />

          {/* Danh sach don hang */}
          <Title level={5}>
            <ShoppingCartOutlined style={{ marginRight: 6 }} />
            Lịch sử đơn hàng ({user.orders?.length || 0})
          </Title>
          <Table
            columns={orderColumns}
            dataSource={user.orders || []}
            rowKey={(record) => record._id || record.orderNumber}
            size="small"
            pagination={{ pageSize: 5, size: "small" }}
            scroll={{ x: 640 }}
            locale={{ emptyText: "Chưa có đơn hàng nào" }}
          />

          <Divider />

          {/* Dia chi */}
          <Title level={5}>
            <EnvironmentOutlined style={{ marginRight: 6 }} />
            Địa chỉ ({user.address?.length || 0})
          </Title>
          {user.address && user.address.length > 0 ? (
            user.address.map((addr, idx) => (
              <div
                key={addr._id || idx}
                style={{
                  padding: "10px 14px",
                  marginBottom: 8,
                  border: addr.isDefault
                    ? "1px solid #1890ff"
                    : "1px solid #f0f0f0",
                  borderRadius: 8,
                  background: addr.isDefault ? "#e6f7ff" : "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong>
                    {addr.fullName} - {addr.phone}
                  </Text>
                  {addr.isDefault && (
                    <Tag color="blue" style={{ margin: 0 }}>
                      Mặc định
                    </Tag>
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {[addr.street, addr.ward, addr.province]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </div>
            ))
          ) : (
            <Text type="secondary">Chưa có địa chỉ nào</Text>
          )}

          <Divider />

          {/* Thong tin he thong */}
          <Title level={5}>Thông tin hệ thống</Title>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Ngày tạo">
              {user.createdAt
                ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {user.updatedAt
                ? dayjs(user.updatedAt).format("DD/MM/YYYY HH:mm")
                : "—"}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "14px 12px",
        borderRadius: 8,
        background: "#fafafa",
        border: "1px solid #f0f0f0",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4, color }}>{icon}</div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <div>
        <Text strong style={{ fontSize: 16 }}>
          {value}
        </Text>
      </div>
    </div>
  );
}

export default UserDetailDrawer;
