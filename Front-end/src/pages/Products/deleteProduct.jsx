import { Button, Popconfirm, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { productServices } from '../../components/services/productServices';
import { useNotification } from '../../components/providers/NotificationProvider';

function DeleteProduct({ record, setReload }) {
  const { success, error: showError } = useNotification();
  
  return (
    <Popconfirm
      title="Xóa sản phẩm?"
      description={`Bạn có chắc muốn xóa "${record.name}" không?`}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
      onConfirm={async () => {
        try {
          const result = await productServices.deleteProduct(record._id);
          success(result.message);
          setReload(prev => !prev);
        } catch (error) {
          console.log("Lỗi kết nối đến server", error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi xóa sản phẩm';
          showError(errorMessage);
        }
      }}
    >
      <Tooltip title="Xóa">
        <Button danger icon={<DeleteOutlined />} />
      </Tooltip>
    </Popconfirm>
  );
}

export default DeleteProduct;
