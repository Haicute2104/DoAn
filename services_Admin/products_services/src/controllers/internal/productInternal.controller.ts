import { isValidObjectId } from "mongoose";
import { Product } from "../../models";
import { TryCatch } from "../../helpers/tryCatch";
import { confirmStock, releaseStock, reserveStock } from "../../services/stockRevervation.service";

export const updateQuantity = TryCatch(async (req, res) => {
  const { productId, size, status } = req.params;
  const { quantity } = req.body;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: "ProductId không hợp lệ" });
  }

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
  }

  if (!["success", "cancel"].includes(status)) {
    return res.status(400).json({ message: "Status không hợp lệ (success | cancel)" });
  }

  const sign = status === "success" ? -1 : 1;

  const updated = await Product.updateOne(
    { _id: productId, "sizeStock.size": size },
    {
      $inc: {
        "sizeStock.$.stock": sign * quantity,
        "sizeStock.$.sold":  -sign * quantity,
        totalSold:           -sign * quantity,
        totalStock:           sign * quantity,
      },
    },
  );

  if (updated.modifiedCount === 0) {
    return res.status(400).json({ message: "Không tìm thấy size sản phẩm" });
  }

  return res.status(200).json({ message: "Cập nhật tồn kho thành công" });
});


export const reserveStockHandler = TryCatch(async (req, res) => {
  const { userId, items } = req.body;
  const result = await reserveStock(userId, items);
  return res.status(200).json(result);
});

export const confirmStockHandler = TryCatch(async (req, res) => {
  const { reservationId } = req.body;
  const result = await confirmStock(reservationId);
  return res.status(200).json(result);
});

export const releaseStockHandler = TryCatch(async (req, res) => {
  const { reservationId } = req.body;
  await releaseStock(reservationId);
  return res.status(200).json({ message: 'Released' });
});

export const getCategoryMap = TryCatch(async (_req, res) => {
  const products = await Product.find({}, { _id: 1, category: 1 })
    .populate("category", "name")
    .lean();

  const map = products.map((p) => ({
    productId: String(p._id),
    categoryName: (p.category as { name?: string })?.name ?? "Không phân loại",
  }));

  return res.status(200).json({ map });
});