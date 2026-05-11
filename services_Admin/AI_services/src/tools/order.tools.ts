import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";

const ORDER_URL = process.env.ORDER_SERVICE_URL || "http://localhost:5004";

const STATUS_MAP: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
};

const PAYMENT_STATUS_MAP: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

export const getUserOrdersTool = tool(
  async ({ userId }) => {
    try {
      const res = await axios.get(
        `${ORDER_URL}/internal/order/statement/${userId}`,
      );
      const orders = res.data.statement;

      if (!orders || orders.length === 0) {
        return "Bạn chưa có đơn hàng nào.";
      }

      const recent = orders.slice(0, 10);

      const formatted = recent.map(
        (
          o: {
            orderNumber: string;
            status: string;
            paymentStatus: string;
            totalAmount: number;
            items: { name: string; size: string; quantity: number }[];
            createdAt: string;
          },
          i: number,
        ) => {
          const items = o.items
            .map(
              (item: { name: string; size: string; quantity: number }) =>
                `${item.name} (size ${item.size} x${item.quantity})`,
            )
            .join(", ");

          return [
            `${i + 1}. Mã đơn: ${o.orderNumber}`,
            `   Trạng thái: ${STATUS_MAP[o.status] || o.status}`,
            `   Thanh toán: ${PAYMENT_STATUS_MAP[o.paymentStatus] || o.paymentStatus}`,
            `   Tổng tiền: ${o.totalAmount.toLocaleString("vi-VN")}đ`,
            `   Sản phẩm: ${items}`,
            `   Ngày đặt: ${new Date(o.createdAt).toLocaleDateString("vi-VN")}`,
          ].join("\n");
        },
      );

      return `Bạn có ${orders.length} đơn hàng. Hiển thị ${recent.length} đơn gần nhất:\n\n${formatted.join("\n\n")}`;
    } catch (err) {
      return `Lỗi khi tra cứu đơn hàng: ${(err as Error).message}`;
    }
  },
  {
    name: "get_user_orders",
    description:
      "Lấy danh sách đơn hàng của user hiện tại. BẮT BUỘC truyền userId từ thông tin hệ thống cung cấp ở đầu cuộc hội thoại.",
    schema: z.object({
      userId: z
        .string()
        .describe("ID của user (lấy từ thông tin hệ thống đầu cuộc hội thoại)"),
    }),
  },
);

export const getOrderDetailTool = tool(
  async ({ orderNumber, userId }) => {
    try {
      const res = await axios.get(
        `${ORDER_URL}/internal/order/statement/${userId}`,
      );
      const orders = res.data.statement;

      if (!orders || orders.length === 0) {
        return "Không tìm thấy đơn hàng nào.";
      }

      const order = orders.find(
        (o: { orderNumber: string; _id: string }) =>
          o.orderNumber === orderNumber || o._id === orderNumber,
      );

      if (!order) {
        return `Không tìm thấy đơn hàng với mã "${orderNumber}". Hãy kiểm tra lại mã đơn.`;
      }

      const items = order.items
        .map(
          (
            item: {
              name: string;
              size: string;
              quantity: number;
              price: number;
            },
            i: number,
          ) =>
            `  ${i + 1}. ${item.name} - Size ${item.size} - SL: ${item.quantity} - ${item.price.toLocaleString("vi-VN")}đ`,
        )
        .join("\n");

      const addr = order.shippingAddress;

      return [
        `Mã đơn: ${order.orderNumber}`,
        `Trạng thái: ${STATUS_MAP[order.status] || order.status}`,
        `Thanh toán: ${PAYMENT_STATUS_MAP[order.paymentStatus] || order.paymentStatus}`,
        `Phương thức: ${order.paymentMethod}`,
        `Ngày đặt: ${new Date(order.createdAt).toLocaleDateString("vi-VN")}`,
        ``,
        `Sản phẩm:`,
        items,
        ``,
        `Tạm tính: ${order.subtotal.toLocaleString("vi-VN")}đ`,
        `Phí ship: ${order.shippingFee.toLocaleString("vi-VN")}đ`,
        `Tổng: ${order.totalAmount.toLocaleString("vi-VN")}đ`,
        ``,
        `Địa chỉ: ${addr.fullName}, ${addr.phone}`,
        `${addr.street}, ${addr.ward}, ${addr.city}`,
        order.trackingNumber
          ? `Mã vận đơn: ${order.trackingNumber}`
          : null,
        order.customerNote ? `Ghi chú: ${order.customerNote}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    } catch (err) {
      return `Lỗi khi tra cứu đơn hàng: ${(err as Error).message}`;
    }
  },
  {
    name: "get_order_detail",
    description:
      "Xem chi tiết một đơn hàng cụ thể theo mã đơn (orderNumber) hoặc ID. BẮT BUỘC truyền userId từ thông tin hệ thống.",
    schema: z.object({
      orderNumber: z
        .string()
        .describe("Mã đơn hàng (VD: ORD-1234567890-ABCDE) hoặc ID đơn hàng"),
      userId: z
        .string()
        .describe("ID của user (lấy từ thông tin hệ thống đầu cuộc hội thoại)"),
    }),
  },
);

export const orderTools = [getUserOrdersTool, getOrderDetailTool];
