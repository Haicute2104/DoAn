import { Modal, Form, Input } from 'antd';

const { TextArea } = Input;

function FormCategory({ 
  isModalVisible, 
  setIsModalVisible, 
  isEditing, 
  editingCategory, 
  form,
  loading,
  onSubmit 
}) {

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Modal
      title={
        <div className="modal-title-custom">
          {isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </div>
      }
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEditing ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy bỏ"
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        name="category_form"
      >
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[
            { required: true, message: 'Vui lòng nhập tên danh mục!' },
          ]}
        >
          <Input placeholder="Ví dụ: Áo dài cách tân" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
        >
          <TextArea rows={4} placeholder="Nhập mô tả cho danh mục này..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default FormCategory;
