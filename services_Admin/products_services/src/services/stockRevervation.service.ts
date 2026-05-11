import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../configs/redis";
import { Product } from "../models";

interface ReserveItem {
  productId: string;
  size: string;
  quantity: number;
}

const RESERVATION_TTL = 600; // 10 phút — thời gian giữ chỗ logic
const RESERVATION_REDIS_TTL = 1200; // 20 phút — TTL thực trên Redis (buffer cho cron dọn)

// ────────────────────────────────────────────────────────────────
// reserveStock — Giữ chỗ khi user vào trang checkout
// ────────────────────────────────────────────────────────────────
export async function reserveStock(userId: string, items: ReserveItem[]) {
  const reservationId = uuidv4();
  const reservedKeys: { key: string; quantity: number }[] = [];

  try {
    for (const item of items) {
      const key = `reserve:${item.productId}:${item.size}`;

      const product = await Product.findOne(
        { _id: item.productId, "sizeStock.size": item.size },
        { "sizeStock.$": 1 },
      );

      if (!product || !product.sizeStock[0]) {
        throw { status: 404, message: "Sản phẩm hoặc size không tồn tại" };
      }

      const dbStock = product.sizeStock[0].stock;
      const currentReserved = parseInt((await redisClient.get(key)) || "0", 10);
      const available = dbStock - currentReserved;

      if (available < item.quantity) {
        throw {
          status: 409,
          message: `Size "${item.size}" chỉ còn ${Math.max(available, 0)} sản phẩm khả dụng`,
        };
      }

      await redisClient.incrBy(key, item.quantity);
      reservedKeys.push({ key, quantity: item.quantity });
    }

    const reservationData = JSON.stringify({
      userId,
      items,
      createdAt: Date.now(),
    });

    await redisClient.setEx(
      `reservation:${reservationId}`,
      RESERVATION_REDIS_TTL,
      reservationData,
    );

    return { reservationId, expiresIn: RESERVATION_TTL };
  } catch (error) {
    for (const { key, quantity } of reservedKeys) {
      await redisClient.decrBy(key, quantity);
    }
    throw error;
  }
}

// ────────────────────────────────────────────────────────────────
// confirmStock — Xác nhận đặt hàng: trừ MongoDB + giải phóng Redis
// ────────────────────────────────────────────────────────────────
export async function confirmStock(reservationId: string) {
  const raw = await redisClient.get(`reservation:${reservationId}`);
  if (!raw) {
    throw {
      status: 410,
      message: "Phiên giữ chỗ đã hết hạn, vui lòng thử lại",
    };
  }

  const reservation = JSON.parse(raw) as {
    userId: string;
    items: ReserveItem[];
    createdAt: number;
  };

  if (Date.now() - reservation.createdAt > RESERVATION_TTL * 1000) {
    await releaseStock(reservationId);
    throw {
      status: 410,
      message: "Phiên giữ chỗ đã hết hạn, vui lòng thử lại",
    };
  }

  const confirmedItems: ReserveItem[] = [];

  try {
    for (const item of reservation.items) {
      const result = await Product.updateOne(
        {
          _id: item.productId,
          sizeStock: {
            $elemMatch: { size: item.size, stock: { $gte: item.quantity } },
          },
        },
        {
          $inc: {
            "sizeStock.$.stock": -item.quantity,
            "sizeStock.$.sold": item.quantity,
            totalSold: item.quantity,
            totalStock: -item.quantity,
          },
        },
      );

      if (result.matchedCount === 0) {
        throw {
          status: 409,
          message: `Size "${item.size}" đã hết hàng`,
        };
      }

      confirmedItems.push(item);
    }
  } catch (error) {
    for (const item of confirmedItems) {
      await Product.updateOne(
        { _id: item.productId, "sizeStock.size": item.size },
        {
          $inc: {
            "sizeStock.$.stock": item.quantity,
            "sizeStock.$.sold": -item.quantity,
            totalSold: -item.quantity,
            totalStock: item.quantity,
          },
        },
      );
    }
    await releaseStock(reservationId);
    throw error;
  }

  for (const item of reservation.items) {
    const key = `reserve:${item.productId}:${item.size}`;
    const newVal = await redisClient.decrBy(key, item.quantity);
    if (newVal <= 0) await redisClient.del(key);
  }
  await redisClient.del(`reservation:${reservationId}`);

  return { success: true };
}

// ────────────────────────────────────────────────────────────────
// releaseStock — Hủy giữ chỗ (user rời checkout / hết hạn / cron dọn)
// Hàm này PHẢI idempotent: gọi nhiều lần không gây side-effect
// ────────────────────────────────────────────────────────────────
export async function releaseStock(reservationId: string) {
  const raw = await redisClient.get(`reservation:${reservationId}`);
  if (!raw) return;

  const reservation = JSON.parse(raw) as {
    userId: string;
    items: ReserveItem[];
  };

  for (const item of reservation.items) {
    const key = `reserve:${item.productId}:${item.size}`;
    const newVal = await redisClient.decrBy(key, item.quantity);
    if (newVal <= 0) await redisClient.del(key);
  }

  await redisClient.del(`reservation:${reservationId}`);
}

// ────────────────────────────────────────────────────────────────
// cleanupExpiredReservations — Cron job dọn reservation quá hạn
//
// Vì reservation:{id} có Redis TTL = 20 phút (buffer),
// nhưng logic hết hạn là 10 phút (createdAt),
// cron chạy mỗi 2 phút sẽ bắt được reservation hết hạn
// trong khoảng 10-20 phút trước khi Redis auto-delete.
// ────────────────────────────────────────────────────────────────
export async function cleanupExpiredReservations() {
  const now = Date.now();
  let cleaned = 0;

  for await (const keys of redisClient.scanIterator({
    MATCH: "reservation:*",
    COUNT: 100,
  })) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
      try {
        const raw = await redisClient.get(key);
        if (!raw) continue;

        const data = JSON.parse(raw);
        if (!data.createdAt || !data.items) continue;

        if (now - data.createdAt > RESERVATION_TTL * 1000) {
          const id = key.replace("reservation:", "");
          await releaseStock(id);
          cleaned++;
        }
      } catch (err) {
        console.error(`[CronJob] Error processing ${key}:`, err);
      }
    }
  }

  if (cleaned > 0) {
    console.log(`[CronJob] Đã dọn ${cleaned} reservation hết hạn`);
  }
}
