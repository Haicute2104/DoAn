import { useEffect, useState } from "react";
import { userServices } from "../../../components/services/userServices";
import {
  Card,
  Table,
  Typography,
  Tag,
  Avatar,
  Button,
  Form,
  Space,
  Tooltip,
  Input,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNotification } from "../../../components/providers/NotificationProvider";
import dayjs from "dayjs";
import DeleteAdminAccount from "./deleteAdmin";
import FormModalAdmin from "./formModal";
const { Title, Text } = Typography;

const ROLE_MAP = {
  admin: { label: "Admin", color: "red" },
  staff: { label: "Nhân viên", color: "blue" },
};

function AccountsAdmin() {
  const [dataAccounts, setDataAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const { success, error: showError } = useNotification();
  const [form] = Form.useForm();

  const isEditMode = !!editingUser;

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await userServices.getAllAdminAccounts();
        setDataAccounts(response.users);
      } catch (error) {
        showError(
          error?.response?.data?.message || "Lỗi lấy danh sách tài khoản",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchApi();
  }, [reload]);

  const openAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      gender: record.gender,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setSubmitLoading(true);
    try {
      if (isEditMode) {
        const payload = { ...values };
        if (!payload.password) delete payload.password;
        const response = await userServices.updateAdminAccount(
          editingUser._id || editingUser.id,
          payload,
        );
        success(response.message || "Cập nhật tài khoản thành công");
      } else {
        const response = await userServices.createAdminAccount(values);
        success(response.message || "Tạo tài khoản thành công");
      }
      closeModal();
      setReload((prev) => !prev);
    } catch (error) {
      showError(error?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setSubmitLoading(false);
    }
  };



  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, _record, index) => index + 1,
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      align: "center",
      render: (phone) => phone || "—",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role) => {
        const mapped = ROLE_MAP[role] || { label: role, color: "default" };
        return <Tag color={mapped.color}>{mapped.label}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Hoạt động" : "Chưa kích hoạt"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          <DeleteAdminAccount record={record} setReload={setReload} />
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Card className="main-card" styles={{ body: { padding: "24px" } }}>
        <div className="header-wrapper">
          <div className="header-left">
            <div className="header-icon-box">
              <TeamOutlined style={{ fontSize: "24px" }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý Tài khoản Admin
              </Title>
              <Text type="secondary">Các tài khoản admin hiện có</Text>
            </div>
          </div>
          <div className="header-right">
            <Input
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={
            searchText
              ? dataAccounts.filter((user) => {
                  const keyword = searchText.toLowerCase();
                  return (
                    user.fullName?.toLowerCase().includes(keyword) ||
                    user.email?.toLowerCase().includes(keyword) ||
                    user.phone?.toLowerCase().includes(keyword)
                  );
                })
              : dataAccounts
          }
          rowKey={(record) => record._id || record.id}
          loading={loading}
        />
      </Card>

      <FormModalAdmin
        isModalVisible={isModalVisible}
        closeModal={closeModal}
        isEditMode={isEditMode}
        form={form}
        onFinish={onFinish}
        submitLoading={submitLoading}
      />
    </div>
  );
}

export default AccountsAdmin;
