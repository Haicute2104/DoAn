import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spin, Result, Button } from "antd";
import { useNotification } from "../../components/providers/NotificationProvider";
import { useAuthStore } from "../../components/stores/useAuthStore";

function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { activeAccount } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    const handleActivate = async () => {
      if (!token) {
        setResult({
          status: 'error',
          title: 'Link không hợp lệ',
          subTitle: 'Token không được tìm thấy trong link kích hoạt.'
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await activeAccount(token);
        
        if (response && response.message) {
          setResult({
            status: 'success',
            title: 'Kích hoạt tài khoản thành công',
            subTitle: response.message || 'Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.'
          });
          success('Kích hoạt tài khoản thành công');
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Link kích hoạt không hợp lệ hoặc đã hết hạn';
        setResult({
          status: 'error',
          title: 'Kích hoạt tài khoản thất bại',
          subTitle: errorMessage
        });
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    handleActivate();
  }, [token, activeAccount, success, showError]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Đang kích hoạt tài khoản..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <Result
        status={result?.status}
        title={result?.title}
        subTitle={result?.subTitle}
        extra={[
          <Button type="primary" key="login" onClick={() => navigate('/auth')}>
            Đăng nhập
          </Button>,
          <Button key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        ]}
      />
    </div>
  );
}

export default ActivateAccount;