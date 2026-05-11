import { TryCatch } from "../../helpers/tryCatch";
import Order, { OrderStatus, PaymentStatus, IOrderItem } from "../../models/order.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import axios from "axios";

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

const fetchUser = async (userId: string) => {
  try {
    const res = await axios.get(
      `${process.env.USER_SERVICE_URL}/internal/user/${userId}`,
    );
    return res.data;
  } catch {
    return null;
  }
};

export const index = TryCatch(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        try {
          const userRes = await fetchUser(order.userId);

          return {
            ...order.toObject(),
            user: userRes?.user ?? null,
          };
        } catch {
          return {
            ...order.toObject(),
            user: null,
          };
        }
      }),
    );

    return res.status(200).json({
      message: "Tất cả đơn hàng đã có",
      orders: updatedOrders,
    });
  },
);

export const show = TryCatch(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Đơn hàng không tồn tại",
      });
    }

    const userRes = await fetchUser(order.userId);

    return res.status(200).json({
      ...order.toObject(),
      user: userRes?.user ?? null,
    });
  },
);

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const updateStatus = TryCatch(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, trackingNumber, shippingProvider, note } = req.body as {
      status: OrderStatus;
      trackingNumber?: string;
      shippingProvider?: string;
      note?: string;
    };

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Đơn hàng không tồn tại",
      });
    }

    const oldStatus = order.status;

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Không thể chuyển từ "${order.status}" sang "${status}"`,
      });
    }

    const requireTracking = [OrderStatus.SHIPPED];
    if (requireTracking.includes(status) && !trackingNumber) {
      return res.status(400).json({
        message: "Vui lòng nhập mã vận đơn",
      });
    }

    order.status = status;

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    if (shippingProvider) {
      order.shippingProvider = shippingProvider;
    }

    if (status === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancelledBy = req.userId ?? "admin";
      order.cancellationReason = note || "Admin hủy đơn";

      try {
        await adjustStock(order.items as IOrderItem[], "cancel");
      } catch (err) {
        console.error(`[Admin] Hoàn stock thất bại cho đơn ${order.orderNumber}:`, err);
      }
    }

    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();

      const isCOD = order.paymentMethod?.toUpperCase() === "COD";
      if (isCOD) {
        order.paymentStatus = PaymentStatus.PAID;
        order.paidAt = new Date();
      }
    }

    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: req.userId ?? "",
      note: note || `Chuyển từ ${oldStatus} -> ${status}`,
    });

    await order.save();

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    });
  },
);

export const getStatement = TryCatch(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { idUser } = req.params;
    const orders = await Order.find({ userId: idUser });

    const totalOrder = orders.length;
    const totalPrice = orders
      .filter((order) => order.status !== OrderStatus.CANCELLED)
      .reduce((acc, order) => acc + order.totalAmount, 0);
    const totalCancelOrder = orders.filter(
      (order) => order.status === OrderStatus.CANCELLED,
    ).length;

    return res.status(200).json({
      message: "Lấy báo cáo thành công",
      statement: orders,
      totalOrder,
      totalPrice,
      totalCancelOrder,
    });
  },
);