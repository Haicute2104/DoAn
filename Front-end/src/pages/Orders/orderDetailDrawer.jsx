import {
  Drawer,
  Descriptions,
  Tag,
  Typography,
  Divider,
  Table,
  Timeline,
  Space,
  Image,
  Flex,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", color: "gold" },
  confirmed: { label: "Đã xác nhận", color: "blue" },
  shipped: { label: "Đang giao", color: "orange" },
  delivered: { label: "Hoàn thành", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

const PAYMENT_STATUS_MAP = {
  unpaid: { label: "Chưa thanh toán", color: "default" },
  paid: { label: "Đã thanh toán", color: "green" },
  failed: { label: "Thất bại", color: "red" },
  refunded: { label: "Đã hoàn tiền", color: "purple" },
};

const SHIPPING_METHOD_MAP = {
  standard: "Tiêu chuẩn",
  express: "Nhanh",
  same_day: "Trong ngày",
};

const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

const itemColumns = [
  {
    title: "Sản phẩm",
    key: "product",
    render: (_, record) => (
      <Flex gap={12} align="center">
        <Image
          src={record.image}
          alt={record.name}
          width={50}
          height={50}
          style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIyNSIgeT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNiZmJmYmYiIGZvbnQtc2l6ZT0iMTAiPk5vIGltZzwvdGV4dD48L3N2Zz4="
        />
        <div style={{ minWidth: 0 }}>
          <Text strong ellipsis style={{ display: "block", maxWidth: 220 }}>
            {record.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Size: {record.size}
          </Text>
        </div>
      </Flex>
    ),
  },
  {
    title: "Đơn giá",
    dataIndex: "price",
    key: "price",
    width: 110,
    align: "right",
    render: (v) => formatVND(v),
  },
  {
    title: "SL",
    dataIndex: "quantity",
    key: "quantity",
    width: 50,
    align: "center",
  },
  {
    title: "Thành tiền",
    dataIndex: "subtotal",
    key: "subtotal",
    width: 120,
    align: "right",
    render: (v) => <Text strong>{formatVND(v)}</Text>,
  },
];

function SectionHeader({ icon, children }) {
  return (
    <Title level={5} style={{ marginBottom: 12 }}>
      {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
      {children}
    </Title>
  );
}

function OrderDetailDrawer({ open, onClose, order }) {
  if (!order) return null;

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: "default" };
  const paymentInfo = PAYMENT_STATUS_MAP[order.paymentStatus] || { label: order.paymentStatus, color: "default" };
  const addr = order.shippingAddress || {};

  return (
    <Drawer
      title={
        <Flex justify="space-between" align="center">
          <Space>
            <ShoppingCartOutlined />
            <span>Chi tiết đơn hàng</span>
          </Space>
          <Tag color={statusInfo.color} style={{ fontSize: 13, padding: "2px 12px", marginRight: 0 }}>
            {statusInfo.label}
          </Tag>
        </Flex>
      }
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
      destroyOnHidden
    >
      {/* ── Thông tin đơn hàng ── */}
      <SectionHeader icon={<FileTextOutlined />}>Thông tin đơn hàng</SectionHeader>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Mã đơn hàng" span={2}>
          <Text copyable strong style={{ color: "#900c3f" }}>
            {order.orderNumber}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {order.createdAt ? dayjs(order.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật">
          {order.updatedAt ? dayjs(order.updatedAt).format("DD/MM/YYYY HH:mm") : "—"}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* ── Khách hàng & Địa chỉ ── */}
      <SectionHeader icon={<UserOutlined />}>Thông tin nhận hàng</SectionHeader>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label={<><UserOutlined style={{ marginRight: 6 }} />Họ tên</>}>
          {addr.fullName || "—"}
        </Descriptions.Item>
        <Descriptions.Item label={<><PhoneOutlined style={{ marginRight: 6 }} />SĐT</>}>
          {addr.phone || "—"}
        </Descriptions.Item>
        {addr.email && (
          <Descriptions.Item label={<><MailOutlined style={{ marginRight: 6 }} />Email</>}>
            {addr.email}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={<><EnvironmentOutlined style={{ marginRight: 6 }} />Địa chỉ</>}>
          {[addr.street, addr.ward, addr.district, addr.city].filter(Boolean).join(", ") || "—"}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* ── Danh sách sản phẩm ── */}
      <SectionHeader icon={<ShoppingCartOutlined />}>
        Sản phẩm ({order.items?.length || 0})
      </SectionHeader>
      <Table
        dataSource={order.items || []}
        columns={itemColumns}
        rowKey={(record) => record.productId}
        pagination={false}
        size="small"
        scroll={{ x: 500 }}
      />

      <Divider />

      {/* ── Thanh toán ── */}
      <SectionHeader icon={<DollarOutlined />}>Thanh toán</SectionHeader>
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          padding: "16px 20px",
        }}
      >
        <Flex justify="space-between" style={{ marginBottom: 8 }}>
          <Text type="secondary">Tạm tính</Text>
          <Text>{formatVND(order.subtotal)}</Text>
        </Flex>
        <Flex justify="space-between" style={{ marginBottom: 8 }}>
          <Text type="secondary">Phí vận chuyển</Text>
          <Text>{formatVND(order.shippingFee)}</Text>
        </Flex>
        {order.discountAmount > 0 && (
          <Flex justify="space-between" style={{ marginBottom: 8 }}>
            <Text type="secondary">
              Giảm giá {order.couponCode && <Tag size="small">{order.couponCode}</Tag>}
            </Text>
            <Text style={{ color: "#ff4d4f" }}>-{formatVND(order.discountAmount)}</Text>
          </Flex>
        )}
        {order.tax > 0 && (
          <Flex justify="space-between" style={{ marginBottom: 8 }}>
            <Text type="secondary">Thuế</Text>
            <Text>{formatVND(order.tax)}</Text>
          </Flex>
        )}
        <Divider style={{ margin: "12px 0" }} />
        <Flex justify="space-between">
          <Text strong style={{ fontSize: 15 }}>Tổng cộng</Text>
          <Text strong style={{ fontSize: 18, color: "#ff4d4f" }}>
            {formatVND(order.totalAmount)}
          </Text>
        </Flex>

        <Divider style={{ margin: "12px 0" }} dashed />

        <Flex justify="space-between" align="center">
          <Text type="secondary">Phương thức</Text>
          <Text strong style={{ textTransform: "uppercase" }}>{order.paymentMethod}</Text>
        </Flex>
        <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
          <Text type="secondary">Trạng thái</Text>
          <Tag color={paymentInfo.color}>{paymentInfo.label}</Tag>
        </Flex>
        {order.paidAt && (
          <Flex justify="space-between" style={{ marginTop: 8 }}>
            <Text type="secondary">Thanh toán lúc</Text>
            <Text>{dayjs(order.paidAt).format("DD/MM/YYYY HH:mm")}</Text>
          </Flex>
        )}
      </div>

      <Divider />

      {/* ── Vận chuyển ── */}
      <SectionHeader icon={<CarOutlined />}>Vận chuyển</SectionHeader>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Hình thức">
          {SHIPPING_METHOD_MAP[order.shippingMethod] || order.shippingMethod || "—"}
        </Descriptions.Item>
        {order.shippingProvider && (
          <Descriptions.Item label="Đơn vị vận chuyển">
            {order.shippingProvider}
          </Descriptions.Item>
        )}
        {order.trackingNumber && (
          <Descriptions.Item label="Mã vận đơn">
            <Text copyable>{order.trackingNumber}</Text>
          </Descriptions.Item>
        )}
        {order.estimatedDeliveryDate && (
          <Descriptions.Item label="Dự kiến giao">
            {dayjs(order.estimatedDeliveryDate).format("DD/MM/YYYY")}
          </Descriptions.Item>
        )}
        {order.deliveredAt && (
          <Descriptions.Item label="Đã giao lúc">
            {dayjs(order.deliveredAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* ── Ghi chú ── */}
      {(order.customerNote || order.adminNote || order.cancellationReason) && (
        <>
          <Divider />
          <SectionHeader icon={<FileTextOutlined />}>Ghi chú</SectionHeader>
          <Descriptions column={1} size="small" bordered>
            {order.customerNote && (
              <Descriptions.Item label="Ghi chú KH">{order.customerNote}</Descriptions.Item>
            )}
            {order.adminNote && (
              <Descriptions.Item label="Ghi chú Admin">{order.adminNote}</Descriptions.Item>
            )}
            {order.cancellationReason && (
              <Descriptions.Item label="Lý do huỷ">
                <Text type="danger">{order.cancellationReason}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {/* ── Lịch sử trạng thái ── */}
      {order.statusHistory?.length > 0 && (
        <>
          <Divider />
          <SectionHeader icon={<ClockCircleOutlined />}>Lịch sử trạng thái</SectionHeader>
          <Timeline
            items={[...order.statusHistory]
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .map((h) => {
                const info = STATUS_MAP[h.status] || { label: h.status, color: "default" };
                return {
                  color: info.color === "gold" ? "orange" : info.color,
                  content: (
                    <div>
                      <Flex justify="space-between" align="center">
                        <Tag color={info.color}>{info.label}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(h.updatedAt).format("DD/MM/YYYY HH:mm")}
                        </Text>
                      </Flex>
                      {h.note && (
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                          {h.note}
                        </Text>
                      )}
                    </div>
                  ),
                };
              })}
          />
        </>
      )}
    </Drawer>
  );
}

export default OrderDetailDrawer;
