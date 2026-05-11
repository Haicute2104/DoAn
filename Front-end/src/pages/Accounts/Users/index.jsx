import { useEffect, useState, useCallback } from "react";
import { userServices } from "../../../components/services/userServices";
import {
  Card,
  Table,
  Typography,
  Tag,
  Avatar,
  Button,
  Space,
  Tooltip,
  Input,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNotification } from "../../../components/providers/NotificationProvider";
import dayjs from "dayjs";
import BanUserModal from "./banUserModal";
import UserDetailDrawer from "./userDetailDrawer";

const { Title, Text } = Typography;

function AccountsUsers() {
  const [dataUsers, setDataUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { success, error: showError } = useNotification();

  const [banModal, setBanModal] = useState({ open: false, record: null, action: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchApi = async () => {
      setLoading(true);
      try {
        const response = await userServices.getAllUserAccounts();
        setDataUsers(response.users);
      } catch (error) {
        showError(
          error?.response?.data?.message || "Lỗi lấy danh sách tài khoản user"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchApi();
  }, [reload]);

  const openBanModal = (record, action) => {
    setBanModal({ open: true, record, action });
  };

  const closeBanModal = () => {
    setBanModal({ open: false, record: null, action: null });
  };

  const handleBanConfirm = async () => {
    const { record, action } = banModal;
    if (!record) return;
    try {
      const id = record._id || record.id;
      if (action === "ban") {
        const res = await userServices.banUserAccount(id);
        success(res.message || "Khóa tài khoản thành công");
      } else {
        const res = await userServices.unbanUserAccount(id);
        success(res.message || "Mở khóa tài khoản thành công");
      }
      closeBanModal();
      setReload((prev) => !prev);
    } catch (error) {
      showError(error?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const openDetailDrawer = useCallback(async (record) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const response = await userServices.getUserDetail(record._id);
      console.log(response);
      setSelectedUser({
        ...response.user,
        orders: response.orders,
        totalOrder: response.totalOrder,
        totalPrice: response.totalPrice,
        totalCancelOrder: response.totalCancelOrder,
      });
    } catch (error) {
      showError(error?.response?.data?.message || "Lỗi lấy thông tin user");
      setDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, [showError]);

  const closeDetailDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  const getStatusTag = (record) => {
    if (record.isBanned) {
      return <Tag color="red">Bị khóa</Tag>;
    }
    if (!record.isActive) {
      return <Tag color="default">Chưa kích hoạt</Tag>;
    }
    return <Tag color="green">Hoạt động</Tag>;
  };

  const filteredData = dataUsers.filter((user) => {
    if (!searchText) return true;
    const keyword = searchText.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.phone?.toLowerCase().includes(keyword)
    );
  });

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
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      render: (gender) => gender || "—",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: (_, record) => getStatusTag(record),
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Bị khóa", value: "banned" },
        { text: "Chưa kích hoạt", value: "inactive" },
      ],
      onFilter: (value, record) => {
        if (value === "banned") return record.isBanned === true;
        if (value === "inactive") return !record.isActive && !record.isBanned;
        return record.isActive && !record.isBanned;
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => openDetailDrawer(record)}
            />
          </Tooltip>

          {record.isBanned ? (
            <Tooltip title="Mở khóa">
              <Button
                type="primary"
                icon={<UnlockOutlined />}
                onClick={() => openBanModal(record, "unban")}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Khóa tài khoản">
              <Button
                danger
                icon={<LockOutlined />}
                onClick={() => openBanModal(record, "ban")}
              />
            </Tooltip>
          )}
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
              <UserOutlined style={{ fontSize: "24px" }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý Tài khoản User
              </Title>
              <Text type="secondary">
                Tổng cộng {dataUsers.length} tài khoản người dùng
              </Text>
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
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record) => record._id || record.id}
          loading={loading}
        />
      </Card>

      <BanUserModal
        open={banModal.open}
        record={banModal.record}
        action={banModal.action}
        onConfirm={handleBanConfirm}
        onCancel={closeBanModal}
      />

      <UserDetailDrawer
        open={drawerOpen}
        onClose={closeDetailDrawer}
        user={selectedUser}
        loading={detailLoading}
      />
    </div>
  );
}

export default AccountsUsers;
