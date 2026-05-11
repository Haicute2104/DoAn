import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { TryCatch } from "../helpers/tryCatch";
import axios from "axios";

const ORDER_URL = process.env.ORDER_SERVICE_URL || "http://order:5004";
const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || "http://products:5003";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  subtotal: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  items: OrderItem[];
  createdAt: string;
  deliveredAt?: string;
  paidAt?: string;
  cancelledAt?: string;
}

interface CategoryMapItem {
  productId: string;
  categoryName: string;
}

async function fetchOrders(from?: string, to?: string): Promise<OrderData[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const url = `${ORDER_URL}/internal/report/orders${params.toString() ? `?${params}` : ""}`;
  const res = await axios.get(url);
  return res.data.orders || [];
}

async function fetchCategoryMap(): Promise<Map<string, string>> {
  const res = await axios.get(`${PRODUCT_URL}/api/v1/client/product/internal/category-map`);
  const items: CategoryMapItem[] = res.data.map || [];
  const map = new Map<string, string>();
  for (const item of items) {
    map.set(item.productId, item.categoryName);
  }
  return map;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date, group: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  switch (group) {
    case "monthly":
      return `${y}-${m}`;
    case "weekly": {
      const dayOfWeek = date.getDay() || 7;
      const monday = new Date(date);
      monday.setDate(date.getDate() - dayOfWeek + 1);
      const wy = monday.getFullYear();
      const wm = String(monday.getMonth() + 1).padStart(2, "0");
      const wd = String(monday.getDate()).padStart(2, "0");
      return `${wy}-${wm}-${wd}`;
    }
    default:
      return `${y}-${m}-${d}`;
  }
}

// GET /dashboard
export const getDashboard = TryCatch(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const orders = await fetchOrders();

    const today = startOfDay(new Date());

    const nonCancelled = orders.filter((o) => o.status !== "cancelled");
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
    const todayNonCancelled = todayOrders.filter((o) => o.status !== "cancelled");

    const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayRevenue = todayNonCancelled.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = nonCancelled.length > 0 ? Math.round(totalRevenue / nonCancelled.length) : 0;

    const statusBreakdown: Record<string, number> = {};
    const paymentBreakdown: Record<string, number> = {};

    for (const o of orders) {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
      paymentBreakdown[o.paymentStatus] = (paymentBreakdown[o.paymentStatus] || 0) + 1;
    }

    return res.status(200).json({
      totalRevenue,
      todayRevenue,
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      avgOrderValue,
      totalCancelled: statusBreakdown["cancelled"] || 0,
      statusBreakdown,
      paymentBreakdown,
    });
  },
);

// GET /revenue?from=&to=&group=daily|weekly|monthly
export const getRevenue = TryCatch(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { from, to, group = "daily" } = req.query as {
      from?: string;
      to?: string;
      group?: string;
    };

    const orders = await fetchOrders(from, to);
    const nonCancelled = orders.filter((o) => o.status !== "cancelled");

    const grouped = new Map<string, { revenue: number; orderCount: number }>();

    for (const o of nonCancelled) {
      const key = formatDateKey(new Date(o.createdAt), group);
      const entry = grouped.get(key) || { revenue: 0, orderCount: 0 };
      entry.revenue += o.totalAmount;
      entry.orderCount += 1;
      grouped.set(key, entry);
    }

    const data = Array.from(grouped.entries())
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({ data });
  },
);

// GET /revenue/by-category?from=&to=
export const getRevenueByCategory = TryCatch(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { from, to } = req.query as { from?: string; to?: string };

    const [orders, categoryMap] = await Promise.all([
      fetchOrders(from, to),
      fetchCategoryMap(),
    ]);

    const nonCancelled = orders.filter((o) => o.status !== "cancelled");

    const grouped = new Map<string, { revenue: number; quantity: number; orderCount: number }>();

    for (const order of nonCancelled) {
      const orderCategories = new Set<string>();

      for (const item of order.items) {
        const category = categoryMap.get(item.productId) || "Không phân loại";
        const entry = grouped.get(category) || { revenue: 0, quantity: 0, orderCount: 0 };
        entry.revenue += item.subtotal;
        entry.quantity += item.quantity;
        orderCategories.add(category);
        grouped.set(category, entry);
      }

      for (const cat of orderCategories) {
        const entry = grouped.get(cat)!;
        entry.orderCount += 1;
      }
    }

    const data = Array.from(grouped.entries())
      .map(([category, val]) => ({ category, ...val }))
      .sort((a, b) => b.revenue - a.revenue);

    return res.status(200).json({ data });
  },
);

// GET /revenue/by-payment?from=&to=
export const getRevenueByPayment = TryCatch(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { from, to } = req.query as { from?: string; to?: string };

    const orders = await fetchOrders(from, to);
    const nonCancelled = orders.filter((o) => o.status !== "cancelled");

    const grouped = new Map<string, { revenue: number; orderCount: number }>();

    for (const o of nonCancelled) {
      const method = o.paymentMethod || "unknown";
      const entry = grouped.get(method) || { revenue: 0, orderCount: 0 };
      entry.revenue += o.totalAmount;
      entry.orderCount += 1;
      grouped.set(method, entry);
    }

    const data = Array.from(grouped.entries())
      .map(([paymentMethod, val]) => ({ paymentMethod, ...val }))
      .sort((a, b) => b.revenue - a.revenue);

    return res.status(200).json({ data });
  },
);

// GET /orders?from=&to=&group=daily|weekly|monthly
export const getOrderStats = TryCatch(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { from, to, group = "daily" } = req.query as {
      from?: string;
      to?: string;
      group?: string;
    };

    const orders = await fetchOrders(from, to);

    const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

    const grouped = new Map<string, Record<string, number>>();

    for (const o of orders) {
      const key = formatDateKey(new Date(o.createdAt), group);
      if (!grouped.has(key)) {
        const entry: Record<string, number> = { total: 0 };
        for (const s of statuses) entry[s] = 0;
        grouped.set(key, entry);
      }
      const entry = grouped.get(key)!;
      entry[o.status] = (entry[o.status] || 0) + 1;
      entry.total += 1;
    }

    const data = Array.from(grouped.entries())
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({ data });
  },
);
