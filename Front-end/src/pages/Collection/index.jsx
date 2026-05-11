import {
  FolderOpenOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  StarFilled,
  PictureOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import {
  Card,
  Table,
  Typography,
  Button,
  Input,
  Image,
  Tooltip,
  Badge,
  Space,
  Tag,
  message
} from "antd";
import { useEffect, useState } from "react";
import { collectionServices } from "../../components/services/collectionServices";
import FormCollection from "./formCollection";
import DeleteCollection from "./deleteCollection";

const { Title, Text } = Typography;

// Component riêng để hiển thị sản phẩm của collection (xử lý async)
function ProductsCell({ collectionId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await collectionServices.getProductByIdCollection(collectionId);
        setProducts(res.products || []);
      } catch (error) {
        console.log("Lỗi lấy sản phẩm:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (collectionId) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [collectionId]);

  if (loading) {
    return <LoadingOutlined />;
  }

  if (products.length === 0) {
    return <Text type="secondary">Chưa có sản phẩm</Text>;
  }

  return (
    <div className="product-tags-container">
      {products.slice(0, 2).map(p => (
        <Tag color="purple" key={p._id}>{p.name}</Tag>
      ))}
      {products.length > 2 && <Tag>+{products.length - 2} khác</Tag>}
    </div>
  );
}

function Collections() {
  const [collections, setCollections] = useState([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await collectionServices.getAllCollections();
        setCollections(response.collections || []);
      } catch (error) {
        console.log("Lỗi lấy danh sách bộ sưu tập:", error);
        message.error("Không thể tải danh sách bộ sưu tập!");
      } finally {
        setLoading(false);
      }
    };
    fetchApi();
  }, [reload]);

  // Mở modal thêm mới
  const showAddModal = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const showEditModal = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };



  // Callback khi thêm/sửa thành công
  const handleSuccess = () => {
    setReload(!reload);
  };

  const columns = [
    {
      title: 'Tên Bộ Sưu Tập',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      align: 'center',
      render: (text, record) => (
        <div>
          <Space>
            <Text strong style={{ fontSize: '15px' }}>{text}</Text>
            {record.isFeatured && (
              <Tooltip title="Bộ sưu tập nổi bật">
                <StarFilled style={{ color: '#faad14' }} />
              </Tooltip>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: '80px',
      align: 'center',
      render: (url) => (
        url ? (
          <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <div style={{
            width: 50,
            height: 50,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4
          }}>
            <PictureOutlined style={{ color: '#ccc' }} />
          </div>
        )
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '120px',
      align: 'center',
      render: (isActive) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? 'Hiển thị' : 'Ẩn'}
        />
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      align: 'center',
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>
          {text || '-'}
        </Text>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'products',
      width: '20%',
      align: 'center',
      render: (_, record) => <ProductsCell collectionId={record._id} />
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '15%',
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

          <DeleteCollection record={record} setReload={setReload}/>
        </Space>
      ),
    },
  ];

  const filteredData = collections.filter(item =>
    item.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="collection-container">
      <Card>
        {/* Header */}
        <div className="header-wrapper">
          <div className="header-left">
            <div className="header-icon-box">
              <FolderOpenOutlined style={{ fontSize: '24px' }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>Quản lý Bộ Sưu Tập</Title>
              <Text type="secondary">Quản lý banner, trạng thái và sản phẩm</Text>
            </div>
          </div>

          <div className="header-actions">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchText(e.target.value)}
              className="search-input"
              allowClear
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

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          bordered
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Form Modal */}
      <FormCollection
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        editingRecord={editingRecord}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default Collections;
