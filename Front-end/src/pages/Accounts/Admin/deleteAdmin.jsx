import { Popconfirm, Button, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { userServices } from "../../../components/services/userServices";
import { useNotification } from "../../../components/providers/NotificationProvider";

function DeleteAdminAccount({ record, setReload }) {
  const { success, error: showError } = useNotification();

  const handleDelete = async () => {
    try {
      const response = await userServices.deleteAdminAccount(
        record._id || record.id,
      );
      success(response.message || "Xóa tài khoản thành công");
      setReload((prev) => !prev);
    } catch (error) {
      showError(error?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <Popconfirm
      title="Xóa tài khoản?"
      description={`Bạn có chắc muốn xóa "${record.fullName}" không?`}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
      onConfirm={handleDelete}
    >
      <Tooltip title="Xóa">
        <Button danger icon={<DeleteOutlined />} />
      </Tooltip>
    </Popconfirm>
  );
}

export default DeleteAdminAccount;
