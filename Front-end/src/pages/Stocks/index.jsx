import { useState, useEffect } from "react";
import { productServices } from "../../components/services/productServices";
import {
  Card,
  Table,
  Typography,
  Button,
  Image,
  Form,
  Tag,
  Input,
} from "antd";
import {
  AppstoreOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./index.css";
import { useNotification } from "../../components/providers/NotificationProvider";
import ModalForm from "./modalForm";
const { Title, Text } = Typography;

function Stocks() {
  const [dataStock, setDataStock] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { success, error: showError } = useNotification();
  const [reload, setReload] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const result = await productServices.getStock();
        setDataStock(result.stockProduct);
      } catch (error) {
        console.log("Lỗi lấy tồn kho sản phẩm", error);
      }
    };
    fetchApi();
  }, [reload]);

  const openAdjustModal = (product, sizeItem) => {
    setSelectedItem({
      productId: product._id || product.id,
      productName: product.name,
      sizeId: sizeItem._id,
      size: sizeItem.size,
      stock: sizeItem.stock,
      sold: sizeItem.sold,
    });
    form.setFieldsValue({ type: "import", quantity: null });
    setIsModalVisible(true);
  };

  const onFinish = async (values) => {
    try {
      const result = await productServices.adjustInventory(
        selectedItem.productId,
        selectedItem.sizeId,
        values.type,
        values.quantity
      );
      success(result.message || "Cập nhật tồn kho thành công");
      setReload((prev) => !prev);
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      showError(err?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const columns = [
    {
      title: "STT",
      render: (_, _record, index) => <span>{index + 1}</span>,
      align: "center",
      width: 60,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      align: "center",
      width: 100,
      render: (_, record) => (
        <div className="table-image">
          {record.thumbnail?.url && (
            <Image width={50} src={record.thumbnail.url} />
          )}
        </div>
      ),
    },
    {
      title: "Tồn kho tổng",
      dataIndex: "totalStock",
      key: "totalStock",
      align: "center",
    },
    {
      title: "Tổng đã bán",
      dataIndex: "totalSold",
      key: "totalSold",
      align: "center",
    },
  ];

  const expandedRowRender = (product) => {
    const sizeColumns = [
      {
        title: "Kích cỡ (Size)",
        dataIndex: "size",
        key: "size",
        align: "center",
        render: (size) => <Tag>{size}</Tag>,
      },
      {
        title: "Tồn kho",
        dataIndex: "stock",
        key: "stock",
        align: "center",
      },
      {
        title: "Đã bán",
        dataIndex: "sold",
        key: "sold",
        align: "center",
      },
      {
        title: "Thao tác",
        key: "action",
        align: "center",
        render: (_, sizeItem) => (
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            size="small"
            onClick={() => openAdjustModal(product, sizeItem)}
          >
            Nhập/Xuất kho
          </Button>
        ),
      },
    ];

    return (
      <Table
        columns={sizeColumns}
        dataSource={product.sizeStock || []}
        pagination={false}
        rowKey="_id"
      />
    );
  };


  return (
    <div className="page-container">
      <Card className="main-card" styles={{ body: { padding: "24px" } }}>
        {" "}
        <div className="header-wrapper">
          <div className="header-left">
            <div className="header-icon-box">
              <AppstoreOutlined style={{ fontSize: "24px" }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý Tồn kho
              </Title>
              <Text type="secondary">Các sản phẩm có trong kho</Text>
            </div>
          </div>
          <div className="header-right">
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={
            searchText
              ? dataStock.filter((item) =>
                  item.name?.toLowerCase().includes(searchText.toLowerCase())
                )
              : dataStock
          }
          rowKey={(record) => record._id || record.id}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) =>
              record.sizeStock && record.sizeStock.length > 0,
          }}
        />
      </Card>

      <ModalForm
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        selectedItem={selectedItem}
        form={form}
        onFinish={onFinish}
      />
    </div>
  );
}

export default Stocks;
