import { Form, Input, Button } from 'antd';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotification } from '../../providers/NotificationProvider';

const RegisterForm = ({ form, isSubmitting, setIsSubmitting, onLoginClick }) => {
  const { register } = useAuthStore();
  const { success, error: showError } = useNotification();

  const handleRegister = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await register(values.fullName, values.email, values.password);

      if (response && response.message) {
        success(response.message);
        form.resetFields();
        onLoginClick();
      } else {
        showError(response?.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đăng ký thất bại';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-section">
      <h2 className="section-title">Đăng ký</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleRegister}
        className="register-form"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder="Email" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input placeholder="Họ và tên" autoComplete="name" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Mật khẩu không được để trống.' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' },
            {
              pattern: /(?=.*[a-z])/,
              message: 'Mật khẩu phải chứa ít nhất một chữ cái thường.'
            },
            {
              pattern: /(?=.*[A-Z])/,
              message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa.'
            },
            {
              pattern: /(?=.*\d)/,
              message: 'Mật khẩu phải chứa ít nhất một số.'
            },
            {
              pattern: /(?=.*[@$!%*#?&])/,
              message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@$!%*#?&).'
            }
          ]}
        >
          <Input.Password placeholder="Mật khẩu" autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={['password']}
          autoComplete="new-password"
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Xác nhận mật khẩu" autoComplete="new-password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            Đăng ký
          </Button>
        </Form.Item>

        <Form.Item>
          <div className="form-footer">
            Đã có tài khoản?{' '}
            <a onClick={(e) => { e.preventDefault(); onLoginClick(); }} className="link-text" href="#">
              Đăng nhập
            </a>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterForm;

