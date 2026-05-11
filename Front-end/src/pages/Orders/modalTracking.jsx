import { Modal, Select, Input } from "antd";

function ModalTracking({
  isTrackingModalVisible,
  handleConfirmShipping,
  handleCancelShipping,
  updatingId,
  shippingOrderId,
  pendingStatus,
  trackingNumber,
  setTrackingNumber,
  shippingProvider,
  setShippingProvider,
}) {
  return (
    <Modal
      title="Thông tin vận chuyển"
      open={isTrackingModalVisible}
      onOk={handleConfirmShipping}
      onCancel={handleCancelShipping}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={updatingId === shippingOrderId}
    >
      <div style={{ marginBottom: 16 }}>
        Vui lòng nhập thông tin vận chuyển để cập nhật trạng thái đơn hàng thành{" "}
        <strong>
          {pendingStatus === "delivered" ? "Hoàn thành" : "Đang giao"}
        </strong>
        .
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Đơn vị vận chuyển
        </label>
        <Select
          placeholder="Chọn đơn vị vận chuyển"
          value={shippingProvider || undefined}
          onChange={(val) => setShippingProvider(val)}
          style={{ width: "100%" }}
          options={[
            { value: "GHN", label: "Giao Hàng Nhanh (GHN)" },
            { value: "GHTK", label: "Giao Hàng Tiết Kiệm (GHTK)" },
            { value: "J&T", label: "J&T Express" },
            { value: "SPX", label: "Shopee Express (SPX)" },
            { value: "Viettel Post", label: "Viettel Post" },
            { value: "VNPost", label: "VNPost" },
            { value: "Ninja Van", label: "Ninja Van" },
            { value: "Best Express", label: "Best Express" },
            { value: "Khác", label: "Khác" },
          ]}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Mã vận đơn
        </label>
        <Input
          placeholder="Nhập mã vận đơn (VD: SPX123456789)..."
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          onPressEnter={handleConfirmShipping}
          autoFocus
        />
      </div>
    </Modal>
  );
}

export default ModalTracking;