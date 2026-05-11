import { Modal, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Text } = Typography;

function BanUserModal({ open, record, action, onConfirm, onCancel }) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const isBan = action === "ban";

  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      await onConfirm();
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: isBan ? "#ff4d4f" : "#52c41a", marginRight: 8 }}
          />
          {isBan ? "Khóa tài khoản" : "Mở khóa tài khoản"}
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={isBan ? "Khóa" : "Mở khóa"}
      cancelText="Hủy"
      okButtonProps={{
        danger: isBan,
        loading: confirmLoading,
      }}
      destroyOnHidden
    >
      <div style={{ padding: "12px 0" }}>
        {isBan ? (
          <Text>
            Bạn có chắc muốn khóa tài khoản{" "}
            <Text strong>"{record?.fullName}"</Text> không?
            <br />
            <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
              Người dùng sẽ không thể đăng nhập sau khi bị khóa.
            </Text>
          </Text>
        ) : (
          <Text>
            Bạn có chắc muốn mở khóa tài khoản{" "}
            <Text strong>"{record?.fullName}"</Text> không?
            <br />
            <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
              Người dùng sẽ có thể đăng nhập lại sau khi được mở khóa.
            </Text>
          </Text>
        )}
      </div>
    </Modal>
  );
}

export default BanUserModal;
