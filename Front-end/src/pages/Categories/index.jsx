import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Form, 
  Input, 
  Space, 
  message, 
  Card, 
  Typography, 
  Tag,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  AppstoreOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
import { categoryServices } from '../../components/services/categoryServices';
import './index.css';
import DeleteCategory from './deteleCategory';
import FormCategory from './formCategory';
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [reload, setReload] = useState(false);
  
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, [reload]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryServices.getAllCategory();
      console.log(response);
      setCategories(response.categories);
      setLoading(false);
    } catch (error) {
      console.log("Lỗi lấy danh mục:", error);
      message.error("Không thể tải danh sách danh mục");
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setIsEditing(false);
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setIsEditing(true);
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description
    });
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEditing) {
        const result = await categoryServices.updateCategory(editingCategory._id, values);
        message.success(result.message || 'Cập nhật danh mục thành công!');
      } else {
        const result = await categoryServices.createCategory(values);
        message.success(result.message || 'Thêm danh mục mới thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
      setReload(prev => !prev);
    } catch (error) {
      console.log('Lỗi:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Slug (Đường dẫn)',
      dataIndex: 'slug',
      key: 'slug',
      width: '20%',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          {description || '-'}
        </Tooltip>
      ),
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      key: 'productCount',
      width: '12%',
      align: 'center',
      render: (count) => (
        <Tag color={count > 0 ? 'green' : 'default'}>
          {count || 0} sản phẩm
        </Tag>
      ),
      sorter: (a, b) => (a.productCount || 0) - (b.productCount || 0),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '12%',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              ghost 
              icon={<EditOutlined />} 
              onClick={() => showEditModal(record)} 
            />
          </Tooltip>
          
          <DeleteCategory record={record} setReload={setReload}/>
        </Space>
      ),
    },
  ];

  const filteredData = categories.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <div className="page-container">
        <Card 
          className="main-card"
          bodyStyle={{ padding: '24px' }}
        >
          {/* Header */}
          <div className="header-wrapper">
            <div className="header-left">
              <div className="header-icon-box">
                <AppstoreOutlined style={{ fontSize: '24px' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>Quản lý Danh mục</Title>
                <Text type="secondary">Danh sách các loại Áo dài hiện có</Text>
              </div>
            </div>
            
            <div className="header-actions">
               <Input 
                  placeholder="Tìm kiếm danh mục..." 
                  prefix={<SearchOutlined />} 
                  onChange={e => setSearchText(e.target.value)}
                  className="search-input"
               />
               <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={showAddModal}
                  size="large"
                >
                  Thêm mới
                </Button>
            </div>
          </div>

          {/* Table */}
          <Table 
            columns={columns} 
            dataSource={filteredData} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            bordered
            scroll={{ x: 700 }}
          />
          <FormCategory 
            isModalVisible={isModalVisible} 
            setIsModalVisible={setIsModalVisible} 
            isEditing={isEditing} 
            editingCategory={editingCategory} 
            form={form}
            loading={loading}
            onSubmit={handleFormSubmit}
          />
        </Card>
      </div>
    </>
  );
}
export default Categories;