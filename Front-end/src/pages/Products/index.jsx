import { useEffect, useState, useRef } from "react";
import { productServices } from "../../components/services/productServices";
import { categoryServices } from "../../components/services/categoryServices";
import { Table, Tag, Space, Button, Image, Select, Input, Card, Typography, Tooltip } from "antd";
import { Link } from "react-router-dom";
import DeleteProduct from "./deleteProduct";
import "./index.css";
import { 
  PlusOutlined, 
  EditOutlined,
  ShoppingOutlined,
  SearchOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useNotification } from "../../components/providers/NotificationProvider";

const { Title, Text } = Typography;
// Custom hook debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null);
  const { success, error: showError } = useNotification();
  const [reload, setReload] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Debounce search term - chờ 500ms sau khi user ngừng gõ
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Ref để track request mới nhất (tránh race condition)
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const fetchApi = async () => {
      // Tạo request ID để track
      const requestId = ++latestRequestRef.current;

      setLoading(true);
      try {
        const result = await productServices.getProducts(
          undefined, // page
          undefined, // limit
          selectedCategory || undefined, // category
          undefined, // brand
          undefined, // minPrice
          undefined, // maxPrice
          undefined, // rating
          debouncedSearchTerm || undefined, // search
          undefined, // sort
          undefined, // inStock
          undefined, // onSale
          undefined // productType
        );

        // Chỉ cập nhật state nếu đây là request mới nhất (tránh race condition)
        if (requestId === latestRequestRef.current) {
          setProducts(result.products);
        }
      } catch (error) {
        console.log("Lỗi lấy sản phẩm:", error);
        if (requestId === latestRequestRef.current) {
          setProducts([]);
        }
      } finally {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      }
    };
    fetchApi();
  }, [reload, debouncedSearchTerm, selectedCategory]);

  // Fetch categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryServices.getAllCategory();
        setCategories(result.categories || []);
      } catch (error) {
        console.log("Lỗi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);
  const columns = [
    {
      title: "Số thứ tự",
      render: (text, record, index) => <span>{index + 1}</span>,
      align: 'center',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      className: 'col-product-name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (_, record) => (
        <Tag color="blue">
          {record.category?.name || "Chưa có danh mục"}
        </Tag>
      ),
      align: 'center',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (price) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(price),
    },    
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return (
          <>
            <Tag style={{ cursor: "pointer" }} onClick={() => handleChangeStatus(record._id, text)} color={text === "active" ? "green" : "red"}>{text}</Tag>
          </>
        )
      },
      align: 'center',
    },
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      align: 'center',
      render: (text, record) => {
        return (
          <>
            <div className="table-image">
              {record.thumbnail?.url && <Image src={record.thumbnail.url} />}
            </div>
          </>
        )
      },

    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: '15%',
      render: (record) => (
        <Space size="middle">
          <Tooltip title="Chi tiết">
            <Link to={`detail/${record._id}`}>
              <Button type="primary" ghost icon={<EyeOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Link to={`edit/${record._id}`}>
              <Button type="primary" ghost icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <DeleteProduct record={record} setReload={setReload}/>
        </Space>
      )
    },

  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
    },
  };

  const handleApply = async () => {
    if (!action) {
      return showError("Vui lòng chọn hành động");
    }

    if (selectedRowKeys.length === 0) {
      return showError("Vui lòng chọn ít nhất một sản phẩm");
    }

    // Xử lý action: "status-active", "status-inactive", "delete"
    const parts = action.split('-');
    const actionKey = parts[0]; // "status" hoặc "delete"
    const actionValue = parts[1] || null; // "active", "inactive" hoặc null

    console.log("Action Key:", actionKey);
    console.log("Action Value:", actionValue);
    try {
      const result = await productServices.changeMultipleStatus(selectedRowKeys, actionKey, actionValue);
      success(result.message);
      setSelectedRowKeys([]);
      setReload(!reload);
    } catch (error) {
      console.log("Lỗi thay đổi trạng thái sản phẩm:", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi thay đổi trạng thái sản phẩm';
      showError(errorMessage);
    }

  };

  //Thay đổi trạng thái 1 sản phẩm
  const handleChangeStatus = async (id, text) => {
    try {
      const result = await productServices.changeStatus(id, {
        status: text === "active" ? "inactive" : "active",
      });
      console.log("Kết quả thay đổi trạng thái:", result);
      success(result.message || "Thay đổi trạng thái sản phẩm thành công");
      setReload(!reload);
    } catch (error) {
      console.log("Lỗi thay đổi trạng thái sản phẩm:", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi thay đổi trạng thái sản phẩm';
      showError(errorMessage);
    }
  }

  return (
    <div className="page-container">
      <Card 
        className="main-card"
        size="large"
      >
        {/* Header */}
        <div className="header-wrapper">
          <div className="header-left">
            <div className="header-icon-box">
              <ShoppingOutlined style={{ fontSize: '24px' }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>Quản lý Sản phẩm</Title>
              <Text type="secondary">Danh sách sản phẩm Áo dài</Text>
            </div>
          </div>
          
          <div className="header-actions">
            <Input 
              placeholder="Tìm kiếm sản phẩm..." 
              prefix={<SearchOutlined />} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Link to="create">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="large"
              >
                Thêm mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bulk-actions">
          <Space>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Chọn hành động"
              onChange={(value) => setAction(value)}
              style={{ minWidth: 200 }}
              options={[
                { value: 'status-active', label: 'Hoạt động' },
                { value: 'status-inactive', label: 'Dừng hoạt động' },
                { value: 'delete', label: 'Xóa nhiều sản phẩm' },
              ]}
            />
            <Button type="primary" onClick={handleApply}>
              Áp dụng
            </Button>
          </Space>
          {selectedRowKeys.length > 0 && (
            <Text type="secondary">Đã chọn {selectedRowKeys.length} sản phẩm</Text>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={products}
          pagination={{ pageSize: 5 }}
          rowKey="_id"
          rowSelection={{ type: 'checkbox', ...rowSelection }}
          loading={loading}
          bordered
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  )
}

export default Products;