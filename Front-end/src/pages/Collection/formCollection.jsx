import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Switch,
  Upload,
  Select,
  Typography,
  message
} from "antd";
import { StarFilled, StarOutlined, SkinOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { collectionServices } from "../../components/services/collectionServices";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

function FormCollection({ isModalVisible, setIsModalVisible, editingRecord, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [products, setProducts] = useState([]);
  
  // THÊM MỚI: Dùng fileList để control hiển thị của Antd Upload
  const [fileList, setFileList] = useState([]); 

  const isEditing = !!editingRecord;

  useEffect(() => {
    if (isEditing && isModalVisible && editingRecord?._id) {
      fetchAvailableProducts();
      fetchCollectionProducts();
    }
  }, [isEditing, isModalVisible, editingRecord]);

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        name: editingRecord.name,
        description: editingRecord.description,
        isActive: editingRecord.isActive,
        isFeatured: editingRecord.isFeatured,
      });
      setImageUrl(editingRecord.image || null);
      setImageId(editingRecord.imageId || null);
      
      // SỬA: Set fileList mặc định nếu có ảnh khi mở form Edit
      if (editingRecord.image) {
        setFileList([{
          uid: '-1',
          name: 'banner.png',
          status: 'done',
          url: editingRecord.image,
        }]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setImageUrl(null);
      setImageId(null);
      setImageFile(null);
      setFileList([]); // SỬA: Reset fileList
    }
  }, [editingRecord, form]);

  const fetchAvailableProducts = async () => {
    if (!editingRecord?._id) return;
    try {
      const res = await collectionServices.getAvailableProducts(editingRecord._id);
      setProducts(res.products || []);
    } catch (error) {
      console.log("Lỗi lấy danh sách sản phẩm khả dụng:", error);
    }
  };

  const fetchCollectionProducts = async () => {
    if (!editingRecord?._id) return;
    try {
      const res = await collectionServices.getProductByIdCollection(editingRecord._id);
      const productIds = (res.products || []).map(p => p._id);
      form.setFieldsValue({ productIds });
    } catch (error) {
      console.log("Lỗi lấy sản phẩm của collection:", error);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append('name', values.name || '');
      formData.append('description', values.description || '');
      formData.append('isActive', values.isActive ?? true);
      formData.append('isFeatured', values.isFeatured ?? false);
      if (values.productIds) {
        formData.append('ids', JSON.stringify(values.productIds));
      }

      // Gửi file ảnh nếu có ảnh mới
      if (imageFile && imageFile.originFileObj) {
        formData.append('image', imageFile.originFileObj);
      }

      if (isEditing) {
        await collectionServices.updateCollection(editingRecord._id, formData);
        message.success("Cập nhật bộ sưu tập thành công!");
      } else {
        await collectionServices.createCollection(formData);
        message.success("Tạo bộ sưu tập thành công!");
      }

      form.resetFields();
      setImageUrl(null);
      setImageId(null);
      setImageFile(null);
      setFileList([]);
      setIsModalVisible(false);
      onSuccess?.();
    } catch (error) {
      console.log("Lỗi:", error);
      message.error(error?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setImageUrl(null);
    setImageId(null);
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

  // SỬA: Cập nhật hàm handleChange để đồng bộ fileList
  const handleChange = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);

    if (file.status === 'uploading') {
      setImageLoading(true);
      return;
    }
    // Handle khi người dùng bấm xóa ảnh
    if (file.status === 'removed') {
      setImageFile(null);
      setImageUrl(null);
      return;
    }
    if (file.originFileObj) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result);
        setImageLoading(false);
      };
      reader.readAsDataURL(file.originFileObj);
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
          {isEditing ? 'Cập nhật Bộ Sưu Tập' : 'Thêm Bộ Sưu Tập Mới'}
        </div>
      }
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      confirmLoading={loading}
      okText={isEditing ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      maskClosable={false}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        name="collection_form"
        initialValues={{ isActive: true, isFeatured: false, productIds: [] }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên Bộ Sưu Tập"
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
            >
              <Input placeholder="VD: Áo dài Tết 2024" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col>
            <Form.Item
              name="image"
              label="Ảnh Banner"
            >
              {/* SỬA: Thêm maxCount={1} và fileList={fileList} */}
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
                {/* SỬA: Check độ dài của fileList thay vì imageFile.length */}
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô tả (Description)"
        >
          <TextArea rows={3} placeholder="Mô tả chi tiết về bộ sưu tập..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="isActive"
              label="Trạng thái (Active)"
              valuePropName="checked"
            >
              <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isFeatured"
              label="Nổi bật (Featured)"
              valuePropName="checked"
            >
              <Switch checkedChildren={<StarFilled />} unCheckedChildren={<StarOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        {isEditing ? (
          <Form.Item
            name="productIds"
            label="Danh sách sản phẩm trong Collection"
            tooltip="Chọn các sản phẩm thuộc về bộ sưu tập này"
            style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}
          >
            <Select
              mode="multiple"
              placeholder="Thêm sản phẩm vào BST..."
              style={{ width: '100%' }}
              optionLabelProp="label"
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map(product => (
                <Option key={product._id} value={product._id} label={product.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{product.name}</span>
                    <span style={{ color: '#888' }}>{product.sku || ''}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <div style={{ marginTop: 24, padding: '12px', background: '#f9f9f9', borderRadius: 4, textAlign: 'center' }}>
            <Text type="secondary">
              <SkinOutlined style={{ marginRight: 8 }} />
              Vui lòng tạo Bộ sưu tập trước, sau đó sửa để thêm sản phẩm.
            </Text>
          </div>
        )}
      </Form>
    </Modal>
  );
}

export default FormCollection;