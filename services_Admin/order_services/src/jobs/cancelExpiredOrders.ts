import cron from "node-cron";
import Order, { OrderStatus, PaymentStatus, IOrderItem } from "../models/order.model";
import axios from "axios";

const PAYMENT_EXPIRY_HOURS = 24;
const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL;

async function adjustStock(items: IOrderItem[], status: "success" | "cancel") {
  await Promise.all(
    items.map((item) =>
      axios.patch(
        `${PRODUCT_URL}/internal/updateQuantity/${item.productId}/${item.size}/${status}`,
        { quantity: item.quantity },
      ),
    ),
  );
}

async function cancelExpiredOrders() {
  const expiryDate = new Date(
    Date.now() - PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  try {
    const expiredOrders = await Order.find({
      status: OrderStatus.PENDING,
      paymentStatus: { $in: [PaymentStatus.UNPAID, PaymentStatus.FAILED] },
      createdAt: { $lte: expiryDate },
    });

    if (expiredOrders.length === 0) {
      console.log(`[CronJob] Không có đơn hàng nào cần hủy.`);
      return;
    }

    for (const order of expiredOrders) {
      try {
        await adjustStock(order.items as IOrderItem[], "cancel");
      } catch (err) {
        console.error(`[CronJob] Hoàn stock thất bại cho đơn ${order.orderNumber}:`, err);
      }

      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = new Date();
      order.cancelledBy = "system";
      order.cancellationReason = "Quá thời hạn thanh toán 24 giờ";
      order.statusHistory.push({
        status: OrderStatus.CANCELLED,
        note: "Tự động hủy do quá 24 giờ chưa thanh toán",
        updatedBy: "system",
        updatedAt: new Date(),
      });
      await order.save();
    }

    console.log(`[CronJob] Đã hủy ${expiredOrders.length} đơn hàng quá hạn và hoàn stock.`);
  } catch (err) {
    console.error("[CronJob] Lỗi khi hủy đơn hàng quá hạn:", err);
  }
}

export function startCancelExpiredOrdersJob() {
  cron.schedule("*/30 * * * *", () => {
    console.log("[CronJob] Kiểm tra đơn hàng quá hạn...");
    cancelExpiredOrders();
  });

  console.log("[CronJob] Đã khởi động job hủy đơn hàng quá hạn (mỗi 30 phút)");
}
