import { useNavigate, useSearchParams } from 'react-router-dom';
import { authServices } from '../../components/services/authServices';
import './resetPassword.css';
import { Form, Input, Button } from 'antd';
import { useNotification } from '../../components/providers/NotificationProvider';
import { useEffect } from 'react';
function ResetPassword() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if(!token){
      navigate('/auth');
    }
  }, [token]);


  const handleResetPassword = async (values) => {
    console.log(values.password);
    console.log(token);
    try {
      if(values.password !== values.confirmPassword){
        return showError('Mật khẩu xác nhận không khớp!');
      }
      const response = await authServices.resetPassword(token, values.password);
      console.log(response);
      success(response.message);
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đặt lại mật khẩu thất bại';
      showError(errorMessage);
    }
  }
  
  return (
    <>
      <div className="reset-password-section">
        <h2 className="section-title">Đổi mật khẩu</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleResetPassword}
          className="reset-password-form"
        >
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
            <Button type="primary" htmlType="submit">
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}
export default ResetPassword;