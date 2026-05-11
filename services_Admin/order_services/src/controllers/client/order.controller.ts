import { TryCatch } from "../../helpers/tryCatch";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import Order, { IOrderItem, OrderStatus, PaymentStatus } from "../../models/order.model";
import axios from "axios";

const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL;
const CART_URL = process.env.CART_SERVICE_URL;

interface CartItem {
  productId: string;
  size: string;
  quantity: number;
}

interface ProductData {
  _id: string;
  name: string;
  price: number;
  thumbnail?: { url: string };
}

// ────────────────────────────────────────────────────────────────
// Helpers gọi product service
// ────────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────────
// POST /order/reserve-stock — Proxy: giữ chỗ stock qua products_service
// ────────────────────────────────────────────────────────────────
export const reserveStockProxy = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Danh sách sản phẩm trống" });
  }

  try {
    const response = await axios.post(`${PRODUCT_URL}/internal/reserve-stock`, {
      userId: req.userId,
      items,
    });
    return res.status(200).json(response.data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "Lỗi khi giữ chỗ sản phẩm" });
  }
});

// ────────────────────────────────────────────────────────────────
// POST /order/release-stock — Proxy: hủy giữ chỗ stock
// ────────────────────────────────────────────────────────────────
export const releaseStockProxy = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.status(400).json({ message: "Thiếu reservationId" });
  }

  try {
    await axios.post(`${PRODUCT_URL}/internal/release-stock`, { reservationId });
    return res.status(200).json({ message: "Đã hủy giữ chỗ" });
  } catch {
    return res.status(200).json({ message: "Đã hủy giữ chỗ" });
  }
});

// ────────────────────────────────────────────────────────────────
// GET /order — danh sách đơn của user
// ────────────────────────────────────────────────────────────────
export const index = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return res.status(200).json({
    status: 200,
    message: "Tất cả đơn hàng của bạn đã có",
    orders,
  });
});

// ────────────────────────────────────────────────────────────────
// GET /order/:id — chi tiết đơn
// ────────────────────────────────────────────────────────────────
export const show = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const { id } = req.params;
  const order = await Order.findOne({ userId, _id: id });
  if (!order) {
    return res.status(404).json({ status: 404, message: "Đơn hàng không tồn tại" });
  }
  return res.status(200).json(order);
});

// ────────────────────────────────────────────────────────────────
// POST /order/:idCart — tạo đơn hàng
//
// Flow mới:
//   1. Validate cart + items
//   2. confirmStock(reservationId) → trừ MongoDB + giải phóng Redis
//   3. Tạo order
//   4. Xóa cart
// ────────────────────────────────────────────────────────────────
export const create = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { idCart } = req.params;
  const userId = req.userId;

  try {
    await axios.get(`${CART_URL}/internal/${idCart}`);
  } catch {
    return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
  }

  const { items, fullName, phone, email, address, paymentMethod, note, reservationId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }
  if (!fullName || !phone || !address || !paymentMethod) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }
  if (!reservationId) {
    return res.status(400).json({ message: "Thiếu mã giữ chỗ, vui lòng thử lại" });
  }

  const productIds = [...new Set(items.map((item: CartItem) => item.productId))];
  const productMap = new Map<string, ProductData>();

  await Promise.all(
    productIds.map(async (id) => {
      try {
        const response = await axios.get(`${PRODUCT_URL}/${id}`);
        const p = response.data.product;
        if (p) {
          productMap.set(String(p._id), {
            _id: p._id,
            name: p.name,
            price: p.price,
            thumbnail: p.thumbnail,
          });
        }
      } catch {
        // product not found
      }
    }),
  );

  const missingProducts = items.filter((item: CartItem) => !productMap.has(item.productId));
  if (missingProducts.length > 0) {
    return res.status(400).json({
      message: `Sản phẩm không tồn tại: ${missingProducts.map((i: CartItem) => i.productId).join(", ")}`,
    });
  }

  const orderItems = items.map((item: CartItem) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      name: product.name,
      image: product.thumbnail?.url ?? "",
      price: product.price,
      quantity: item.quantity,
      size: item.size,
      subtotal: product.price * item.quantity,
    };
  });

  const subtotal = orderItems.reduce(
    (sum: number, item: { subtotal: number }) => sum + item.subtotal,
    0,
  );
  const shippingFee = subtotal > 0 ? 30000 : 0;
  const totalAmount = subtotal + shippingFee;

  const shippingAddress = {
    fullName,
    phone,
    email: email ?? "",
    street: address?.street ?? "",
    ward: address?.ward ?? "",
    district: "",
    city: address?.province ?? "",
  };

  // Xác nhận giữ chỗ → trừ stock MongoDB + giải phóng Redis
  try {
    await axios.post(`${PRODUCT_URL}/internal/confirm-stock`, { reservationId });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return res.status(err.response.status).json({
        message: err.response.data?.message || "Sản phẩm đã hết hàng hoặc phiên giữ chỗ đã hết hạn",
      });
    }
    return res.status(409).json({ message: "Không thể xác nhận tồn kho, vui lòng thử lại" });
  }

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const order = await Order.create({
    orderNumber,
    userId,
    items: orderItems,
    subtotal,
    shippingFee,
    totalAmount,
    shippingAddress,
    shippingMethod: "standard",
    paymentMethod,
    customerNote: note,
  });

  try {
    await axios.delete(`${CART_URL}/internal/${idCart}`);
  } catch {
    // cart cleanup failed, order still created
  }

  return res.status(201).json({
    status: 201,
    message: "Đặt hàng thành công",
    order,
  });
});

// ────────────────────────────────────────────────────────────────
// GET /order/:id/retry-payment
// ────────────────────────────────────────────────────────────────
const PAYMENT_EXPIRY_HOURS = 24;

export const retryPayment = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const { id } = req.params;

  const order = await Order.findOne({ userId, _id: id });
  if (!order) {
    return res.status(404).json({ status: 404, message: "Đơn hàng không tồn tại" });
  }

  if (order.status === OrderStatus.CANCELLED) {
    return res.status(400).json({
      status: 400,
      message: "Đơn hàng đã bị hủy, không thể thanh toán lại",
    });
  }

  if (order.status !== OrderStatus.PENDING) {
    return res.status(400).json({
      status: 400,
      message: "Đơn hàng không ở trạng thái chờ thanh toán",
    });
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    return res.status(400).json({
      status: 400,
      message: "Đơn hàng đã được thanh toán",
    });
  }

  const hoursSinceCreated = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreated > PAYMENT_EXPIRY_HOURS) {
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

    return res.status(400).json({
      status: 400,
      message: "Đơn hàng đã quá thời hạn thanh toán (24 giờ) và đã bị hủy",
    });
  }

  return res.status(200).json({
    status: 200,
    message: "Có thể thanh toán lại",
    order,
  });
});

// ────────────────────────────────────────────────────────────────
// PATCH /order/:id/cancel — hủy đơn hàng
//
// Flow mới: stock LUÔN được trừ khi tạo đơn (cả COD lẫn MoMo),
// nên khi hủy → LUÔN hoàn stock.
// ────────────────────────────────────────────────────────────────
export const cancel = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const { id } = req.params;

  const order = await Order.findOne({ userId, _id: id });
  if (!order) {
    return res.status(404).json({ status: 404, message: "Đơn hàng không tồn tại" });
  }

  if (
    order.status !== OrderStatus.PENDING &&
    order.status !== OrderStatus.CONFIRMED
  ) {
    return res.status(400).json({
      status: 400,
      message: "Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận hoặc đã xác nhận",
    });
  }

  try {
    await adjustStock(order.items as IOrderItem[], "cancel");
  } catch (err) {
    console.error("Restore stock failed:", err);
  }

  order.status = OrderStatus.CANCELLED;
  order.cancelledAt = new Date();
  order.cancelledBy = userId;
  order.statusHistory.push({
    status: OrderStatus.CANCELLED,
    note: "Khách hàng hủy đơn",
    updatedBy: userId ?? "customer",
    updatedAt: new Date(),
  });

  await order.save();

  return res.status(200).json({
    status: 200,
    message: "Đơn hàng đã được hủy thành công",
  });
});
