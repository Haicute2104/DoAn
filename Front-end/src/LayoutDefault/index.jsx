import React, { useState } from 'react';
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PhoneOutlined,
  FolderAddOutlined,
  LogoutOutlined,
  FormOutlined,
  ShoppingCartOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme, Button } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../components/stores/useAuthStore';
import { useNotification } from '../components/providers/NotificationProvider';

const { Header, Content, Footer, Sider } = Layout;

function LayoutDefault() {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const logout = useAuthStore((state) => state.logout);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    try {
      await logout();
      
      success('Đăng xuất thành công');
      localStorage.removeItem('rememberUsers');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Đăng xuất thất bại';
      showError(errorMessage);
      
      navigate('/auth', { replace: true });
    }
  };

  return (
    <>
      {/* Khối CSS Thuần giúp dễ dàng tuỳ chỉnh và đồng bộ giao diện */}
      <style>{`

        .admin-sider {
          box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
          z-index: 10;
        }

        /* Logo góc trên cùng Sider */
        .admin-logo-box {
          margin: 16px 12px;
          padding: 8px;
          background: #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.3s;
        }

        .admin-logo-box img {
          width: 100%;
          height: auto;
          max-height: 48px;
          object-fit: contain;
        }

        .admin-logo-box.collapsed img {
          max-height: 32px;
        }

        .admin-inner-layout {
          background: transparent; /* Để lộ ảnh nền của admin-layout */
        }

        .admin-header {
          padding: 0 24px 0 0;
          background: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
          z-index: 9;
        }

        /* Nút Trigger thu phóng Sidebar */
        .header-trigger {
          font-size: 18px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .header-trigger:hover {
          color: #8B1E26;
          background: rgba(0, 0, 0, 0.025);
        }

        .admin-content {
          margin: 24px 16px;
          padding: 24px;
          min-height: 90vh;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
          overflow: auto;
        }

        .admin-footer {
          text-align: center;
          color: rgba(0, 0, 0, 0.65);
          font-weight: 500;
        }
      `}</style>

      <Layout className="admin-layout">
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          className="admin-sider"
        >
          {/* Logo Box */}
          <div className={`admin-logo-box${collapsed ? ' collapsed' : ''}`}>
            <img src="/image/logo.png" alt="Áo Dài Believe" />
          </div>

          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={[
              {
                key: '1',
                icon: <UserOutlined />,
                label: <Link to="/dashboard">Thông tin người dùng</Link>,
              },
              {
                key: '2',
                icon: <VideoCameraOutlined />,
                label: <Link to="/products">Quản lý sản phẩm</Link>,
              },
              {
                key: '3',
                icon: <UploadOutlined />,
                label: <Link to="/categories">Quản lý danh mục</Link>,
              },
              {
                key: '4',
                icon: <FolderAddOutlined />,
                label: <Link to="/collections">Quản lý bộ sưu tập</Link>,
              },
              {
                key: '5',
                icon: <FormOutlined />,
                label: <Link to="/news">Quản lý bài viết</Link>,
              },
              {
                key: '6',
                icon: <FormOutlined />,
                label: <Link to="/stock">Quản lý tồn kho</Link>,
              },
              {
                key: '7',
                icon: <UserOutlined />,
                label: 'Quản lý tài khoản',
                children: [
                  {
                    key: 'account-user',
                    label: <Link to="/accounts/users">Quản lý người dùng</Link>,
                  },
                  {
                    key: 'account-admin',
                      label: <Link to="/accounts/admins">Tài khoản admin</Link>,
                  },
                ],
              },
              {
                key: '9',
                icon: <ShoppingCartOutlined />,
                label: <Link to="/orders">Quản lý đơn hàng</Link>,
              },
              {
                key: '8',
                icon: <PhoneOutlined />,
                label: <Link to="/contact">Quản lý liên hệ</Link>,
              },
              {
                key: '10',
                icon: <BarChartOutlined />,
                label: <Link to="/report">Báo cáo và thống kê</Link>,
              },
            ]}
          />
        </Sider>

        <Layout className="admin-inner-layout">
          <Header className="admin-header">
            {/* Nút Toggle Sidebar */}
            <div 
              className="header-trigger"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            {/* Nút Đăng xuất */}
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              style={{ fontWeight: 500 }}
            >
              Đăng xuất
            </Button>
          </Header>

          <Content className="admin-content">
            <Outlet />
          </Content>

          <Footer className="admin-footer">
            Áo Dài Believe ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    </>
  );
}

export default LayoutDefault;
