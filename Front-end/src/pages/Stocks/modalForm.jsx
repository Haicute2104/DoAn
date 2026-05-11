import { Modal, Form, InputNumber, Radio, Space, Button } from "antd";
import { ImportOutlined, ExportOutlined } from "@ant-design/icons";

import { Typography } from "antd";
const { Text } = Typography;

function ModalForm({
  isModalVisible,
  setIsModalVisible,
  selectedItem,
  form,
  onFinish,
}) {
  const currentType = Form.useWatch("type", form) || "import";
  return (
    <>
      <Modal
        title={
          selectedItem
            ? `${selectedItem.productName} — Size ${selectedItem.size}`
            : "Nhập/Xuất kho"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        {selectedItem && (
          <div className="stock-modal-info">
            <Text>
              Tồn kho hiện tại: <strong>{selectedItem.stock}</strong>
            </Text>
            <Text style={{ marginLeft: 16 }}>
              Đã bán: <strong>{selectedItem.sold}</strong>
            </Text>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: "import" }}
        >
          <Form.Item name="type" label="Loại thao tác">
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value="import" className="stock-radio-import">
                <ImportOutlined /> Nhập kho
              </Radio.Button>
              <Radio.Button value="export" className="stock-radio-export">
                <ExportOutlined /> Xuất kho
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={currentType === "import" ? "Số lượng nhập" : "Số lượng xuất"}
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <InputNumber
              min={1}
              max={currentType === "export" ? selectedItem?.stock : undefined}
              placeholder={
                currentType === "import"
                  ? "Nhập số lượng..."
                  : "Xuất số lượng..."
              }
              style={{
                width: "100%",
                borderColor: currentType === "import" ? "#52c41a" : "#ff4d4f",
              }}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor:
                    currentType === "import" ? "#52c41a" : "#ff4d4f",
                  borderColor: currentType === "import" ? "#52c41a" : "#ff4d4f",
                }}
              >
                {currentType === "import" ? "Xác nhận nhập" : "Xác nhận xuất"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
export default ModalForm;
