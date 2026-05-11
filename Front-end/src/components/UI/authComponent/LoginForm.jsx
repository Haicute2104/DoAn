import { Form, Input, Button, Checkbox, Space } from 'antd';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotification } from '../../providers/NotificationProvider';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginForm = ({ form, rememberMe, setRememberMe, isSubmitting, setIsSubmitting, onForgotPasswordClick, onRegisterClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { success, error: showError } = useNotification();

  const handleLogin = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await login(values.email, values.password);
      console.log('Login response in form:', response);

      if (response && response.accessToken) {
        // Lưu email để tự động điền lần sau (nếu user chọn remember)
        if (rememberMe) {
          localStorage.setItem('rememberUsers', JSON.stringify({
            username: values.email,
          }));
        } else {
          localStorage.removeItem('rememberUsers');
        }

        success('Đăng nhập thành công');
        
        // Đợi một chút để đảm bảo store đã update
        setTimeout(() => {
          // Redirect về trang trước đó hoặc dashboard
          const from = location.state?.from?.pathname || '/dashboard';
          console.log('Navigating to:', from);
          navigate(from, { replace: true });
        }, 100);
      } else {
        console.error('No accessToken in response:', response);
        showError(response?.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error in form:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Đăng nhập thất bại';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-section">
      <h2 className="section-title">Đăng nhập</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleLogin}
        className="login-form"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
        >
          <Input placeholder="Email" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          autoComplete="current-password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password placeholder="Mật khẩu" autoComplete="current-password" />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <a onClick={(e) => { e.preventDefault(); onForgotPasswordClick(); }} className="link-text" href="#">
              Quên mật khẩu?
            </a>
            <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
              Ghi nhớ đăng nhập
            </Checkbox>
          </Space>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            Đăng nhập
          </Button>
        </Form.Item>

        <Form.Item>
          <div className="form-footer">
            Chưa có tài khoản?{' '}
            <a onClick={(e) => { e.preventDefault(); onRegisterClick(); }} className="link-text" href="#">
              Đăng ký
            </a>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;

