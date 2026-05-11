import { Button, Popconfirm, Tooltip, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { newsServices } from "../../components/services/newsServices";

function DeleteNews({ record, refresh }) {
  const handleDelete = async (id) => {
    try {
      await newsServices.deleteNews(id);
      message.success("Xóa bài viết thành công!");
      refresh(); // reload lại danh sách
    } catch (error) {
      message.error("Xóa bài viết thất bại!");
    }
  };
  return (
    <Tooltip title="Xóa">
      <Popconfirm
        title="Xóa bài viết này?"
        description="Bạn có chắc chắn muốn xóa bài viết này không?"
        onConfirm={() => handleDelete(record._id)}
        okText="Đồng ý"
        cancelText="Hủy"
      >
        <Button danger icon={<DeleteOutlined />} />
      </Popconfirm>
    </Tooltip>
  );
}

export default DeleteNews;
