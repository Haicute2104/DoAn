import { TryCatch } from "../../helpers/tryCatch";
import Order, { PaymentStatus } from "../../models/order.model";
import { Request, Response } from "express";
import { OrderStatus } from "../../models/order.model";

// ────────────────────────────────────────────────────────────────
// POST /internal/order/:orderId/payment-status
//
// MoMo callback cập nhật trạng thái thanh toán.
// Stock đã được trừ ngay khi tạo đơn (qua confirmStock),
// nên ở đây chỉ cần cập nhật paymentStatus + status.
// ────────────────────────────────────────────────────────────────
export const updatePaymentStatus = TryCatch(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { paymentStatus, paymentId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Đơn hàng không tồn tại",
      });
    }

    const normalizedStatus = String(paymentStatus || "").toLowerCase();

    if (!Object.values(PaymentStatus).includes(normalizedStatus as PaymentStatus)) {
      return res.status(400).json({ message: "paymentStatus không hợp lệ" });
    }

    const wasPaid = order.paymentStatus === PaymentStatus.PAID;

    order.paymentStatus = normalizedStatus as PaymentStatus;
    order.paymentId = paymentId;

    if (normalizedStatus === PaymentStatus.PAID && !wasPaid) {
      if (order.status === OrderStatus.CANCELLED) {
        await order.save();
        return res.status(409).json({
          message: "Đơn hàng đã bị hủy, không thể xác nhận thanh toán",
          order,
        });
      }

      order.paidAt = new Date();
      order.status = OrderStatus.CONFIRMED;
      order.statusHistory.push({
        status: OrderStatus.CONFIRMED,
        note: "Thanh toán MoMo thành công",
        updatedBy: "system",
        updatedAt: new Date(),
      });
    }

    await order.save();

    return res.status(200).json({
      message: "Cập nhật thanh toán thành công",
      order,
    });
  },
);

export const getStatement = TryCatch(async (req: Request, res: Response) => {
  const { idUser } = req.params;
  const statement = await Order.find({ userId: idUser });
  console.log(statement);
  const totalOrder = statement.length;
  const totalPrice = statement
    .filter(order => order.status !== OrderStatus.CANCELLED)
    .reduce((acc, order) => acc + order.totalAmount, 0);
  const totalCancelOrder = statement.filter(order => order.status === OrderStatus.CANCELLED).length;
  return res.status(200).json({
    message: "Lấy báo cáo thành công",
    statement,
    totalOrder,
    totalPrice,
    totalCancelOrder,
  });
});