import { TryCatch } from "../../helpers/tryCatch";
import Order from "../../models/order.model";
import { Request, Response } from "express";

export const getOrdersForReport = TryCatch(
  async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };

    const filter: Record<string, unknown> = {};

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = toDate;
      }
      filter.createdAt = dateFilter;
    }

    const orders = await Order.find(filter)
      .select("orderNumber status paymentStatus paymentMethod totalAmount subtotal shippingFee discountAmount items createdAt deliveredAt paidAt cancelledAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ orders });
  },
);
