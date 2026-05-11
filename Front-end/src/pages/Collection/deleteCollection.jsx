import { Popconfirm, Tooltip, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { collectionServices } from '../../components/services/collectionServices';
import { shareServices } from '../../components/services/shareServices';
import { useNotification } from '../../components/providers/NotificationProvider';

function DeleteCollection({ record, setReload }) {
  const { success, error: showError } = useNotification();

  return (
    <Popconfirm
      title="Xóa bộ sưu tập?"
      description={`Bạn có chắc muốn xóa "${record.name}" không?`}
      onConfirm={async () => {
        try {
          // Xóa ảnh trên Cloudinary nếu collection có imageId
          if (record.imageId) {
            try {
              await shareServices.deleteImages([record.imageId]);
            } catch (deleteError) {
              console.log("Lỗi xóa ảnh trên Cloudinary:", deleteError);
              // Vẫn tiếp tục xóa collection dù xóa ảnh thất bại
            }
          }

          // Xóa collection trong database
          const result = await collectionServices.deleteCollection(record._id);
          success(result.message || "Xóa bộ sưu tập thành công!");
          setReload(prev => !prev);
        } catch (error) {
          console.log("Lỗi xóa bộ sưu tập:", error);
          const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa bộ sưu tập!";
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
  );
}

export default DeleteCollection;
