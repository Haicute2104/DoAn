import { Form, Input, Button } from 'antd';
import { useNotification } from '../../providers/NotificationProvider';
import { authServices } from '../../services/authServices';

const ForgotPasswordForm = ({ form, isSubmitting, setIsSubmitting, onBackToLogin }) => {
  const { success, error: showError } = useNotification();

  const handleForgotPassword = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await authServices.forgotPassword(values.email);
      console.log(response)
      success(response.message);
      form.resetFields();
      onBackToLogin();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đặt lại mật khẩu thất bại';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-section">
      <h2 className="section-title">Quên mật khẩu</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleForgotPassword}
        autoComplete="off"
        className="forgot-form"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            Đặt lại mật khẩu
          </Button>
        </Form.Item>

        <Form.Item>
          <div className="form-footer">
            <a onClick={(e) => { e.preventDefault(); onBackToLogin(); }} className="link-text" href="#">
              ← Quay lại đăng nhập
            </a>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;

