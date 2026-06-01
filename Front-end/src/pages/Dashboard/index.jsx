import { useEffect, useState } from "react";
import { useAuthStore } from "../../components/stores/useAuthStore";
import { userServices } from "../../components/services/userServices";
import { Form, Input, Button, Upload, Image, Row, Col, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title } = Typography;
function Dashboard() {
  const { userId } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loadingButton, setLoadingButton] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await userServices.getUserById(userId);
        setUser(response.user);
        form.setFieldsValue(response.user);
        console.log(response);
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, form]);

  const handleChangeInfo = async (values) => {
    try {
      setLoadingButton(true);
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      if (values.phone) {
        formData.append('phone', values.phone);
      }
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      await userServices.updateAdminAccount(userId, formData);
      // Refresh user data
      const response = await userServices.getUserById(userId);
      setUser(response.user);
      setFileList([]);
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
    } finally {
      setLoadingButton(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <div>Không tìm thấy thông tin người dùng</div>;
  }

  return (
    <div>
      <Title level={2}>Thông tin cá nhân</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleChangeInfo}
        style={{ maxWidth: 700 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone">
              <Input />
            </Form.Item>

            <Form.Item label="Quyền">
              <Input value={user?.role || "Người dùng"} disabled />
            </Form.Item>
          </Col>

          <Col span={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', justifyContent: 'flex-start' }}>
            <Form.Item label="Ảnh đại diện" name='avatarUrl'>
              <Image
                width={150}
                src={
                  fileList.length > 0
                    ? URL.createObjectURL(fileList[0].originFileObj)
                    : user.thumbnail || "https://cbam.edu.vn/wp-content/uploads/2024/10/avatar-facebook-35.jpg"
                }
                alt="Avatar"
                style={{ borderRadius: "8px", border: "1px solid #ccc" }}
              />
            </Form.Item>

            <Upload
              name="image"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Tải ảnh mới</Button>
            </Upload>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loadingButton}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Dashboard;