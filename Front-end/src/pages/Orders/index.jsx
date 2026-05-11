import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
  Button,
  Select,
  Input,
  Modal,
} from "antd";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { orderServices } from "../../components/services/orderServices";
import { useNotification } from "../../components/providers/NotificationProvider";
import dayjs from "dayjs";
import "./style.css";
import ModalTracking from "./modalTracking";
import OrderDetailDrawer from "./orderDetailDrawer";

const { Title, Text } = Typography;

const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận", color: "gold" },
  { value: "confirmed", label: "Đã xác nhận", color: "blue" },
  { value: "shipped", label: "Đang giao", color: "orange" },
  { value: "delivered", label: "Hoàn thành", color: "green" },
  { value: "cancelled", label: "Đã hủy", color: "red" },
];

const PAYMENT_STATUS_MAP = {
  unpaid: { label: "Chưa thanh toán", color: "default" },
  paid: { label: "Đã thanh toán", color: "green" },
  failed: { label: "Thất bại", color: "red" },
  refunded: { label: "Đã hoàn tiền", color: "purple" },
};

const getStatusOption = (value) =>
  STATUS_OPTIONS.find((s) => s.value === value) || STATUS_OPTIONS[0];

const getAllowedTransitions = (currentStatus) => {
  switch (currentStatus) {
    case "pending":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["shipped", "cancelled"];
    case "shipped":
      return ["delivered"];
    default:
      return [];
  }
};

function Orders() {
  const [allOrderData, setAllOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const { success, error: showError } = useNotification();

  const [isTrackingModalVisible, setIsTrackingModalVisible] = useState(false);
  const [shippingOrderId, setShippingOrderId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingProvider, setShippingProvider] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const result = await orderServices.getAllOrders();
        setAllOrderData(result.orders || []);
      } catch (err) {
        showError(
          err?.response?.data?.message || "Lỗi khi lấy danh sách đơn hàng",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchApi();
  }, [reload]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === "shipped") {
      setShippingOrderId(orderId);
      setPendingStatus(newStatus);
      setIsTrackingModalVisible(true);
      return;
    }

    setUpdatingId(orderId);
    try {
      await orderServices.updateOrderStatus(orderId, { status: newStatus });
      success("Cập nhật trạng thái đơn hàng thành công");
      setReload((prev) => !prev);
    } catch (err) {
      showError(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmShipping = async () => {
    if (!trackingNumber.trim()) {
      showError("Vui lòng nhập mã vận đơn!");
      return;
    }
    if (!shippingProvider.trim()) {
      showError("Vui lòng chọn đơn vị vận chuyển!");
      return;
    }

    setUpdatingId(shippingOrderId);
    try {
      await orderServices.updateOrderStatus(shippingOrderId, {
        status: pendingStatus,
        trackingNumber: trackingNumber.trim(),
        shippingProvider: shippingProvider.trim(),
      });
      success("Cập nhật trạng thái đơn hàng thành công");
      setIsTrackingModalVisible(false);
      setTrackingNumber("");
      setShippingProvider("");
      setPendingStatus(null);
      setShippingOrderId(null);
      setReload((prev) => !prev);
    } catch (err) {
      showError(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelShipping = () => {
    setIsTrackingModalVisible(false);
    setTrackingNumber("");
    setShippingProvider("");
    setPendingStatus(null);
    setShippingOrderId(null);
  };

  const handleCancelOrder = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await orderServices.updateOrderStatus(orderId, { status: "cancelled" });
      success("Đã hủy đơn hàng thành công");
      setReload((prev) => !prev);
    } catch (err) {
      showError(err?.response?.data?.message || "Lỗi khi hủy đơn hàng");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredData = allOrderData.filter((order) => {
    if (!searchText) return true;
    const keyword = searchText.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(keyword) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(keyword) ||
      order.shippingAddress?.phone?.includes(keyword)
    );
  });

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 200,
      render: (text) => <span className="order-code">{text}</span>,
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => {
        const name =
          record.user?.fullName || record.shippingAddress?.fullName || "—";
        const phone = record.shippingAddress?.phone || "";
        return (
          <div className="customer-box">
            <p className="customer-name">{name}</p>
            {phone && <p className="customer-phone">{phone}</p>}
          </div>
        );
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      align: "center",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <div className="items-box">
          {items?.slice(0, 3).map((item, idx) => (
            <span key={idx} className="item-text">
              • {item.name} (x{item.quantity})
            </span>
          ))}
          {items?.length > 3 && (
            <span className="item-more">+{items.length - 3} sản phẩm khác</span>
          )}
        </div>
      ),
    },
    {
      title: "Thanh toán",
      key: "payment",
      align: "center",
      width: 150,
      render: (_, record) => {
        const ps = PAYMENT_STATUS_MAP[record.paymentStatus] || {
          label: record.paymentMethod,
          color: "default",
        };
        return (
          <div className="payment-box">
            <span className="payment-method">{record.paymentMethod}</span>
            <Tag color={ps.color}>{ps.label}</Tag>
          </div>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 140,
      align: "right",
      render: (val) => <span className="total-amount">{formatVND(val)}</span>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      width: 170,
      align: "center",
      filters: STATUS_OPTIONS.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value,
      render: (status, record) => {
        const orderId = record._id;
        const isCancelled = status === "cancelled";
        const isDelivered = status === "delivered";
        const isUpdating = updatingId === orderId;

        // Nếu trạng thái bị vô hiệu hóa, chỉ render Tag
        if (isCancelled || isDelivered) {
          const opt = getStatusOption(status);
          return (
            <Tag color={opt.color} className="rounded-full px-3">
              {opt.label}
            </Tag>
          );
        }

        const allowed = getAllowedTransitions(status);

        return (
          <Select
            value={status}
            onChange={(val) => handleStatusChange(orderId, val)}
            loading={isUpdating}
            disabled={isUpdating || allowed.length === 0}
            size="small"
            style={{ width: 150 }}
            options={[
              {
                value: status,
                label: (
                  <span style={{ fontWeight: 500 }}>
                    {getStatusOption(status).label}
                  </span>
                ),
                disabled: true,
              },
              ...allowed.map((val) => {
                const opt = getStatusOption(val);
                return {
                  value: val,
                  label: (
                    <span
                      style={{
                        color: val === "cancelled" ? "#ff4d4f" : undefined,
                      }}
                    >
                      {opt.label}
                    </span>
                  ),
                };
              }),
            ]}
          />
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => {
        const isCancelled = record.status === "cancelled";
        const isDelivered = record.status === "delivered";
        const orderId = record._id;

        return (
          <Space size="middle">
            <Tooltip title="Xem chi tiết">
              <Button
                type="primary"
                ghost
                icon={<EyeOutlined />}
                onClick={() => {
                  openDetailDrawer(record);
                }}
              />
            </Tooltip>

            {!isCancelled && !isDelivered && (
              <Popconfirm
                title="Hủy đơn hàng"
                description="Bạn có chắc muốn hủy đơn hàng này?"
                okText="Hủy đơn"
                cancelText="Không"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleCancelOrder(orderId)}
              >
                <Tooltip title="Hủy đơn">
                  <Button danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];
  const openDetailDrawer = (record) => {
    setSelectedOrder(record);
    setDrawerOpen(true);
  };

  return (
    <div className="page-container">
      <Card className="main-card" styles={{ body: { padding: "24px" } }}>
        <div className="header-wrapper">
          <div className="header-left">
            <div className="header-icon-box">
              <ShoppingCartOutlined style={{ fontSize: "24px" }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý Đơn hàng
              </Title>
              <Text type="secondary">
                Tổng cộng {allOrderData.length} đơn hàng
              </Text>
            </div>
          </div>

          <div className="header-right">
            <Input
              placeholder="Tìm kiếm theo mã ĐH, tên, SĐT..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="search-input"
            />
          </div>
        </div>

        <Table
          rowKey={(record) => record._id}
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 8,
            placement: ["bottomRight"],
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <ModalTracking
        isTrackingModalVisible={isTrackingModalVisible}
        handleConfirmShipping={handleConfirmShipping}
        handleCancelShipping={handleCancelShipping}
        updatingId={updatingId}
        shippingOrderId={shippingOrderId}
        pendingStatus={pendingStatus}
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        shippingProvider={shippingProvider}
        setShippingProvider={setShippingProvider}
      />

      <OrderDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}

export default Orders;
