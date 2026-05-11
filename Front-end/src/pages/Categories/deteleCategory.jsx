import { categoryServices } from '../../components/services/categoryServices';
import { useNotification } from '../../components/providers/NotificationProvider';
import { Popconfirm, Tooltip, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
function DeleteCategory({ record, setReload }) {
  const { success, error: showError } = useNotification();

  return(
    <>
      <Popconfirm
        title="Xóa danh mục?"
        description={`Bạn có chắc muốn xóa "${record.name}" không?`}
        onConfirm={async () => {
          try {
            const result = await categoryServices.deleteCategory(record._id);
            success(result.message || 'Xóa danh mục thành công!');
            setReload(prev => !prev);
          } catch (error) {
            console.log("Lỗi kết nối đến server", error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi xóa danh mục';
            showError(errorMessage);
          }
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Tooltip title="Xóa">
          <Button danger icon={<DeleteOutlined />} />
        </Tooltip>
      </Popconfirm>
    </>
  )
}
export default DeleteCategory;