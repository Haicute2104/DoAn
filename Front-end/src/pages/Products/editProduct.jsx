import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Switch,
  Card,
  Space,
  Divider,
  Row,
  Col,
  Typography,
  message,
  Upload,
  Modal,
  Spin
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  TagOutlined,
  ShoppingOutlined,
  DollarOutlined,
  FileImageOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { categoryServices } from '../../components/services/categoryServices';
import { shareServices } from '../../components/services/shareServices';
import { productServices } from '../../components/services/productServices';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

// --- Helper: Convert file to Base64 for preview ---
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function EditProduct() {
  const [form] = Form.useForm();
  const params = useParams();
  const navigate = useNavigate();
  const productId = params.id;

  const thumbnailFileList = Form.useWatch('thumbnail', form);
  const productName = Form.useWatch('name', form);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- State cho Upload & Preview ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  // --- State lưu các public_id cần xóa ---
  const [deletedIds, setDeletedIds] = useState([]);

  // Category
  const [categories, setCategories] = useState([]);

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryServices.getAllCategory();
        setCategories(result.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Product Data (Logic khác so với Create)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        const result = await productServices.getProductById(productId);
        const product = result.product;

        // Chuẩn bị dữ liệu Thumbnail cho Upload component
        let initThumbnail = [];
        if (product.thumbnail && product.thumbnail.url) {
          initThumbnail = [{
            uid: '-1',
            name: 'thumbnail',
            status: 'done',
            url: product.thumbnail.url,
            public_id: product.thumbnail.public_id // Lưu public_id để dùng khi xóa
          }];
        }

        // Chuẩn bị dữ liệu Images cho Upload component
        let initImages = [];
        if (product.images && product.images.length > 0) {
          initImages = product.images.map((img, index) => ({
            uid: `-${index + 2}`, // uid âm để tránh xung đột
            name: `image-${index + 1}`,
            status: 'done',
            url: img.url,
            public_id: img.public_id
          }));
        }

        // Fill data vào form
        form.setFieldsValue({
          name: product.name,
          category: product.category?._id || product.category,
          gender: product.gender,
          shortDescription: product.shortDescription,
          description: product.description,
          sizeStock: product.sizeStock || [{ size: '', stock: 0, sold: 0 }],
          specs: product.specs || {},
          price: product.price,
          originalPrice: product.originalPrice,
          cost: product.cost,
          status: product.status,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          // FileList cho Upload
          thumbnail: initThumbnail,
          images: initImages
        });

      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm", error);
        message.error('Không thể tải thông tin sản phẩm');
      } finally {
        setInitialLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, form]);


  // --- Helper: Upload files to backend ---
  const uploadFilesToBackend = async (fileList) => {
    if (!fileList || fileList.length === 0) return [];
    
    const formData = new FormData();
    fileList.forEach(file => {
      if (file.originFileObj) {
        formData.append('files', file.originFileObj);
      }
    });

    try {
      const result = await shareServices.postUploadImage(formData);
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid response format from upload endpoint');
      }
      return result.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Upload failed');
    }
  };

  // --- Handler: Khi xóa ảnh khỏi list ---
  const handleRemoveImage = (file) => {
    // Nếu file có public_id (tức là ảnh cũ từ DB), thêm vào danh sách cần xóa
    if (file.public_id) {
        setDeletedIds(prev => [...prev, file.public_id]);
    }
    // Nếu là ảnh mới up (chưa lưu DB) thì Antd tự xóa khỏi list UI, không cần làm gì thêm
  };

  // --- Xử lý Logic Submit (Tương tự Create nhưng có thêm xóa ảnh trên Cloudinary) ---
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. XÓA ẢNH CŨ TRÊN CLOUDINARY (nếu có)
      if (deletedIds.length > 0) {
        try {
          const deleteResult = await shareServices.deleteImages(deletedIds);
          console.log('Đã xóa ảnh trên Cloudinary:', deleteResult);
        } catch (deleteError) {
          console.error('Lỗi xóa ảnh trên Cloudinary:', deleteError);
          // Có thể hiện warning nhưng vẫn tiếp tục update sản phẩm
          message.warning('Một số ảnh cũ không thể xóa khỏi Cloudinary, nhưng sản phẩm vẫn được cập nhật.');
        }
      }

      // 2. Xử lý Upload Thumbnail
      let thumbnailData = null;
      if (values.thumbnail && values.thumbnail.length > 0) {
        const thumbFile = values.thumbnail[0];
        
        if (thumbFile.originFileObj) {
           // Case: Upload mới
           const uploadResult = await uploadFilesToBackend([thumbFile]);
           if (uploadResult && uploadResult.length > 0) {
             thumbnailData = {
               url: uploadResult[0].url,
               public_id: uploadResult[0].public_id
             };
           }
        } else {
           // Case: Giữ nguyên ảnh cũ
           thumbnailData = {
             url: thumbFile.url,
             public_id: thumbFile.public_id || ''
           };
        }
      }

      // 3. Xử lý Upload Images
      let listImages = [];
      if (values.images && values.images.length > 0) {
        // Lọc file mới
        const filesToUpload = values.images.filter(f => f.originFileObj);
        // Lọc file cũ
        const existingImages = values.images
          .filter(f => !f.originFileObj)
          .map(f => ({
            url: f.url,
            public_id: f.public_id || ''
          }));
        
        if (filesToUpload.length > 0) {
          const uploadResults = await uploadFilesToBackend(filesToUpload);
          const newImages = uploadResults.map(item => ({
            url: item.url,
            public_id: item.public_id
          }));
          listImages = [...existingImages, ...newImages];
        } else {
          listImages = existingImages;
        }
      }

      // 4. Tạo payload (Không cần gửi deleted_public_ids vì đã xóa trực tiếp)
      const finalPayload = {
        ...values,
        thumbnail: thumbnailData,
        images: listImages
      };

      // 5. Gọi API Update
      const result = await productServices.updateProduct(productId, finalPayload);
      message.success(result.message || 'Cập nhật sản phẩm thành công!');
      
      // Reset danh sách xóa sau khi thành công
      setDeletedIds([]);

    } catch (error) {
      console.error("Submit Error:", error);
      message.error('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error('Vui lòng kiểm tra lại các trường thông tin lỗi.', errorInfo);
  };

  // --- Handlers cho Upload UI ---
  const handleCancelPreview = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const validateMessages = {
    required: '${label} là bắt buộc!',
    types: {
      number: '${label} không hợp lệ!',
    },
    number: {
      min: '${label} không được nhỏ hơn ${min}',
    },
    string: {
      min: '${label} phải có ít nhất ${min} ký tự',
    }
  };

  const currencyFormatter = (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const currencyParser = (value) => value.replace(/\$\s?|(,*)/g, '');

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="product-form-wrapper">
      <style>{`
        .product-form-wrapper {
          background-color: #f0f2f5;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .header-title {
          margin: 0 !important;
          color: #262626;
        }
        .custom-card {
          margin-bottom: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
        }
        .custom-card .ant-card-head {
          border-bottom: 1px solid #f0f0f0;
          font-weight: 600;
        }
        .dynamic-list-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 12px;
        }
        .dynamic-list-row .ant-form-item {
          margin-bottom: 0;
        }
        .remove-icon {
          color: #ff4d4f;
          cursor: pointer;
          font-size: 18px;
          transition: color 0.3s;
        }
        .remove-icon:hover {
          color: #cf1322;
        }
        .btn-save {
          background-color: #52c41a; /* Màu xanh lá cho nút Update để khác biệt chút */
          border-color: #52c41a;
        }
        .btn-save:hover {
          background-color: #73d13d;
          border-color: #73d13d;
        }
        .ant-upload-list-picture-card .ant-upload-list-item {
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .dynamic-list-row {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <Title level={2} className="header-title">Chỉnh Sửa Sản Phẩm</Title>
            <Text type="secondary">Cập nhật thông tin sản phẩm {productName ? `#${productName}` : ''}</Text>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={loading}
              className="btn-save"
            >
              Lưu cập nhật
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          validateMessages={validateMessages}
          requiredMark="optional"
        >
          <Row gutter={24}>
            {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
            <Col xs={24} lg={16}>

              {/* 1. Thông tin cơ bản */}
              <Card title={<><TagOutlined /> Thông tin cơ bản</>} className="custom-card">
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[
                    { required: true },
                    { min: 5, message: 'Tên sản phẩm phải dài hơn 5 ký tự' }
                  ]}
                >
                  <Input placeholder="Nhập tên sản phẩm..." size="large" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                      <Select placeholder="Chọn loại">
                        {categories.map((category) => (
                          <Option key={category._id} value={category._id}>
                            {category.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                      <Select placeholder="Chọn giới tính">
                        <Option value="nu">Nữ</Option>
                        <Option value="nam">Nam</Option>
                        <Option value="unisex">Unisex</Option>
                        <Option value="tre_em">Trẻ em</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="shortDescription" label="Mô tả ngắn">
                  <Input.TextArea rows={2} showCount maxLength={200} placeholder="Tóm tắt đặc điểm nổi bật..." />
                </Form.Item>

                <Form.Item name="description" label="Mô tả chi tiết">
                  <Input.TextArea rows={6} placeholder="Nhập mô tả chi tiết sản phẩm..." />
                </Form.Item>
              </Card>

              {/* 2. Kho hàng & Biến thể */}
              <Card title={<><ShoppingOutlined /> Kho hàng & Kích thước</>} className="custom-card">
                <Form.List name="sizeStock">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div key={key} className="dynamic-list-row">
                          <Form.Item
                            {...restField}
                            name={[name, 'size']}
                            rules={[{ required: true, message: 'Nhập size' }]}
                            style={{ flex: 1 }}
                          >
                            <Input placeholder="Size (S, M...)" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'stock']}
                            rules={[
                              { required: true, message: 'Nhập SL' },
                              { type: 'number', min: 0, message: '>= 0' }
                            ]}
                            style={{ flex: 1 }}
                          >
                            <InputNumber placeholder="Tồn kho" style={{ width: '100%' }} />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'sold']}
                            style={{ flex: 1 }}
                          >
                            <InputNumber placeholder="Đã bán" style={{ width: '100%' }} min={0} />
                          </Form.Item>

                          <MinusCircleOutlined onClick={() => remove(name)} className="remove-icon" />
                        </div>
                      ))}
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Thêm biến thể mới
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Card>

              {/* 3. Thông số kỹ thuật */}
              <Card title="Thông số kỹ thuật" className="custom-card">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name={['specs', 'material']} label="Chất liệu" rules={[{ required: true }]}>
                      <Input placeholder="Lụa, Cotton..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['specs', 'origin']} label="Xuất xứ">
                      <Input placeholder="Việt Nam..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['specs', 'style']} label="Phong cách">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['specs', 'season']} label="Mùa thích hợp">
                      <Select>
                        <Option value="Xuan_He">Xuân Hè</Option>
                        <Option value="Thu_Dong">Thu Đông</Option>
                        <Option value="Cả năm">Cả năm</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['specs', 'careInstructions']} label="Hướng dẫn chăm sóc">
                      <Input placeholder="Ví dụ: Giặt tay, không dùng chất tẩy..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['specs', 'elasticity']} label="Độ co giãn">
                      <Select>
                        <Option value="co_gian">Co giãn</Option>
                        <Option value="khong_co_gian">Không co giãn</Option>
                        <Option value="binh_thuong">Bình thường</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name={['specs', 'thickness']} label="Độ dày">
                      <Select>
                        <Option value="chat_giay">Chất giày</Option>
                        <Option value="chat_mong">Chất mỏng</Option>
                        <Option value="vua">Vừa</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* CỘT PHẢI: GIÁ, ẢNH, TRẠNG THÁI */}
            <Col xs={24} lg={8}>
              {/* 4. Định giá */}
              <Card title={<><DollarOutlined /> Định giá</>} className="custom-card">
                <Form.Item
                  name="price"
                  label="Giá bán"
                  rules={[
                    { required: true },
                    { type: 'number', min: 1000, message: 'Giá tối thiểu 1,000đ' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={currencyFormatter}
                    parser={currencyParser}
                    addonAfter="₫"
                    placeholder="0"
                  />
                </Form.Item>

                <Form.Item
                  name="originalPrice"
                  label="Giá gốc (Niêm yết)"
                  dependencies={['price']}
                  rules={[
                    { type: 'number', min: 0 },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('price') <= value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Giá gốc thường phải lớn hơn giá bán!'));
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={currencyFormatter}
                    parser={currencyParser}
                    addonAfter="₫"
                    placeholder="Để trống nếu không KM"
                  />
                </Form.Item>

                <Form.Item name="cost" label="Giá vốn (Chi phí)" rules={[{ type: 'number', min: 0 }]}>
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={currencyFormatter}
                    parser={currencyParser}
                    addonAfter="₫"
                  />
                </Form.Item>
              </Card>

              {/* 5. Trạng thái */}
              <Card title="Trạng thái" className="custom-card">
                <Form.Item name="status" label="Trạng thái hiển thị">
                  <Select>
                    <Option value="active">Đang bán</Option>
                    <Option value="inactive">Dừng bán</Option>
                    <Option value="hidden">Ẩn</Option>
                  </Select>
                </Form.Item>
                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sản phẩm nổi bật</span>
                    <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <span>Hàng mới về</span>
                    <Form.Item name="isNewArrival" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                </div>
              </Card>

              {/* 6. Hình ảnh */}
              <Card title={<><FileImageOutlined /> Hình ảnh</>} className="custom-card">
                <Form.Item
                  name="thumbnail"
                  label="Ảnh đại diện"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  tooltip="Ảnh chính của sản phẩm (Chỉ 1 ảnh)"
                  style={{ display: "flex" }}
                  rules={[
                    { required: true, message: 'Vui lòng tải ảnh đại diện' }
                  ]}
                >
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => false}
                    onPreview={handlePreview}
                    onRemove={handleRemoveImage} // Quan trọng: Bắt sự kiện xóa
                    maxCount={1}
                    showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                  >
                    {thumbnailFileList?.length >= 1 ? null : uploadButton}
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="images"
                  label="Ảnh chi tiết"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  style={{ display: "flex" }}
                  tooltip="Tối đa 4 ảnh. Hỗ trợ kéo thả."
                >
                  <Upload
                    listType="picture-card"
                    beforeUpload={() => false}
                    onPreview={handlePreview}
                    onRemove={handleRemoveImage} // Quan trọng: Bắt sự kiện xóa
                    maxCount={4}
                    multiple
                  >
                    {uploadButton}
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>

        {/* Modal xem trước ảnh */}
        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={handleCancelPreview}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    </div>
  );
}

export default EditProduct;