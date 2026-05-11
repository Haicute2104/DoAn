import { Modal, Form, Input, DatePicker, Select, Button } from "antd";

const PASSWORD_RULES = [
  { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự." },
  { pattern: /(?=.*[a-z])/, message: "Phải chứa ít nhất một chữ thường." },
  { pattern: /(?=.*[A-Z])/, message: "Phải chứa ít nhất một chữ hoa." },
  { pattern: /(?=.*\d)/, message: "Phải chứa ít nhất một số." },
  {
    pattern: /(?=.*[@$!%*#?&])/,
    message: "Phải chứa ít nhất một ký tự đặc biệt (@$!%*#?&).",
  },
];

function FormModalAdmin({
  isModalVisible,
  closeModal,
  isEditMode,
  form,
  onFinish,
  submitLoading,
}) {
  return (
    <Modal
      title={isEditMode ? "Chỉnh sửa tài khoản" : "Thêm mới tài khoản"}
      open={isModalVisible}
      onCancel={closeModal}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không đúng định dạng!" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            isEditMode ? "Mật khẩu (để trống nếu không đổi)" : "Mật khẩu"
          }
          rules={
            isEditMode
              ? PASSWORD_RULES
              : [
                  { required: true, message: "Mật khẩu không được để trống." },
                  ...PASSWORD_RULES,
                ]
          }
        >
          <Input.Password
            placeholder={
              isEditMode ? "Nhập mật khẩu mới..." : "Nhập mật khẩu"
            }
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Ngày sinh"
          name="dateOfBirth"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày sinh"
          />
        </Form.Item>

        <Form.Item
          label="Giới tính"
          name="gender"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select placeholder="Chọn giới tính">
            <Select.Option value="Nam">Nam</Select.Option>
            <Select.Option value="Nữ">Nữ</Select.Option>
            <Select.Option value="Khác">Khác</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
          <Button onClick={closeModal} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={submitLoading}>
            {isEditMode ? "Cập nhật" : "Lưu tài khoản"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default FormModalAdmin;
