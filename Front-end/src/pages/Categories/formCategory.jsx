import { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';

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
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (isEditing && editingCategory?.image) {
      setFileList([{
        uid: '-1',
        name: 'category.png',
        status: 'done',
        url: editingCategory.image,
      }]);
    } else {
      setFileList([]);
      setImageFile(null);
    }
  }, [isEditing, editingCategory, isModalVisible]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const formData = new FormData();
      formData.append('name', values.name || '');
      formData.append('description', values.description || '');

      if (imageFile?.originFileObj) {
        formData.append('image', imageFile.originFileObj);
      }

      onSubmit(formData);
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setImageFile(null);
    setFileList([]);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    return true;
  };

  const handleChange = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);

    if (file.status === 'uploading') {
      setImageLoading(true);
      return;
    }
    if (file.status === 'removed') {
      setImageFile(null);
      return;
    }
    if (file.originFileObj) {
      setImageFile(file);
      setImageLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

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
      destroyOnHidden
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
          name="image"
          label="Ảnh danh mục"
          extra="Ảnh hiển thị tại mục Danh Mục Nổi Bật trên trang chủ"
        >
          <Upload
            name="image"
            listType="picture-card"
            className="avatar-uploader"
            fileList={fileList}
            maxCount={1}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
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
