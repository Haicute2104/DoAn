import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Row, Col, Typography, message, Space } from "antd";
import "./style.css";
import { contactServices } from "../../components/services/contactServices";

const { Title } = Typography;

function Contact() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(null);
  const [reload, setReload] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchApi = async () => {
      try {
        const response = await contactServices.getContact();
        console.log(response);
        setContact(response.contacts);

        // ✅ set data vào form sau khi fetch
        form.setFieldsValue(response.contacts);
      } catch (error) {
        console.log("Lỗi lấy dữ liệu", error);
        message.error("Không thể tải dữ liệu liên hệ!");
      }
    };

    fetchApi();
  }, [form, reload]);

  // ================= SUBMIT =================
  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log(values);
      console.log(contact._id);

      await contactServices.updateContact(contact._id, {contact : values} );
      setReload(!reload);

      message.success("Cập nhật thông tin liên hệ thành công!");
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      message.error("Cập nhật thông tin liên hệ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER =================
  return (
    <div className="cms-layout">
      <div className="cms-header">
        <Title level={4} style={{ margin: 0 }}>
          Quản lý thông tin Liên hệ
        </Title>
      </div>

      <div className="cms-content">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Row gutter={24}>
            {/* LEFT */}
            <Col xs={24} lg={16}>
              <Card title="Thông tin Cửa hàng" className="custom-card">
                <Form.Item
                  name="showroomName"
                  label="Tên cửa hàng (Showroom)"
                  rules={[{ required: true, message: "Vui lòng nhập tên cửa hàng!" }]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Địa chỉ chi tiết"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item name="mapEmbedUrl" label="URL Embed Google Maps">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Card>

              <Card title="Kênh Liên Lạc" className="custom-card">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="phoneHotline" label="Hotline">
                      <Input size="large" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="phoneStore" label="SĐT Cửa hàng">
                      <Input size="large" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="emailPrimary"
                      label="Email chính"
                      rules={[{ type: "email", message: "Email không hợp lệ!" }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="emailSupport"
                      label="Email hỗ trợ"
                      rules={[{ type: "email", message: "Email không hợp lệ!" }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* RIGHT */}
            <Col xs={24} lg={8} className="form-footer">
              <Card title="Giờ mở cửa" className="custom-card">
                <Form.Item name="weekday" label="Ngày thường">
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="sunday" label="Chủ Nhật">
                  <Input size="large" />
                </Form.Item>
              </Card>

              <Card title="Mạng xã hội" className="custom-card">
                <Form.Item name="facebook" label="Facebook">
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="instagram" label="Instagram">
                  <Input size="large" />
                </Form.Item>
              </Card>

              <div className="btn-footer">
                <Space>
                  <Button size="large" onClick={() => form.resetFields()}>
                    Khôi phục
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                  >
                    Lưu thay đổi
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

export default Contact;