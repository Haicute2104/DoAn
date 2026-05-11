import { TryCatch } from "../../helpers/tryCatch";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import Cart from "../../models/cart.model";
import axios from "axios";
import mongoose from "mongoose";


interface SizeStockItem {
  size: string;
  stock: number;
  sold: number;
}

// Lấy giỏ hàng của user
export const index = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const cart = await Cart.findOne({ userId: req.userId });

  if (!cart || cart.items.length === 0) {
    return res.status(200).json({
      message: "Giỏ hàng trống",
      cart: { userId: req.userId, items: [] },
    });
  }

  // Lấy danh sách productId không trùng
  const productIds = [...new Set(cart.items.map((item) => item.productId.toString()))];

  // Gọi product service lấy thông tin tất cả sản phẩm song song
  const productMap = new Map<string, Record<string, unknown>>();
  await Promise.all(
    productIds.map(async (id) => {
      try {
        const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/client/product/${id}`);
        const p = response.data.product;
        productMap.set(id, {
          _id: p._id,
          name: p.name,
          slug: p.slug,
          thumbnail: p.thumbnail,
          price: p.price,
        });
      } catch {
        // Sản phẩm đã bị xóa hoặc không tồn tại
      }
    })
  );

  const itemsWithProduct = cart.items.map((item) => ({
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
    product: productMap.get(item.productId.toString()) ?? null,
  }));

  return res.status(200).json({
    message: "Lấy giỏ hàng thành công",
    cart: {
      _id: cart._id,
      userId: cart.userId,
      items: itemsWithProduct,
    },
  });
});

// Thêm sản phẩm vào giỏ hàng
export const add = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, quantity, size } = req.body;

  if (!productId || !size || !quantity || quantity < 1) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ thông tin (productId, size, quantity)",
    });
  }

  // Gọi nội bộ product service để validate sản phẩm + tồn kho
  let productData;
  try {
    const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/client/product/${productId}`);
    console.log(response.data);
    productData = response.data.product;
  } catch {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  // Kiểm tra size có tồn tại và còn đủ hàng
  const sizeInfo = productData.sizeStock?.find((s: SizeStockItem) => s.size === size);
  if (!sizeInfo) {
    return res.status(400).json({ message: `Size "${size}" không tồn tại cho sản phẩm này` });
  }

  // Tìm giỏ hàng của user
  let cart = await Cart.findOne({ userId: req.userId });

  if (!cart) {
    // Kiểm tra tồn kho trước khi tạo
    if (sizeInfo.stock < quantity) {
      return res.status(400).json({ message: `Size "${size}" chỉ còn ${sizeInfo.stock} sản phẩm` });
    }
    cart = await Cart.create({
      userId: req.userId,
      items: [{ productId, size, quantity }],
    });
    return res.status(201).json({ message: "Đã thêm vào giỏ hàng", cart });
  }

  // Kiểm tra item cùng productId + size đã có trong giỏ chưa
  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId && item.size === size
  );

  const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

  if (sizeInfo.stock < newQuantity) {
    return res.status(400).json({
      message: `Size "${size}" chỉ còn ${sizeInfo.stock} sản phẩm${existingItem ? `, bạn đã có ${existingItem.quantity} trong giỏ` : ""}`,
    });
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({ productId, size, quantity });
  }

  await cart.save();
  return res.status(200).json({ message: "Đã cập nhật giỏ hàng", cart });
});

// Cập nhật số lượng một item trong giỏ
export const update = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, size } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
  }

  // Validate tồn kho
  try {
    const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/client/product/${productId}`);
    console.log(response.data);
    const sizeInfo = response.data.product?.sizeStock?.find((s: SizeStockItem) => s.size === size);
    if (!sizeInfo) {
      return res.status(400).json({ message: `Size "${size}" không tồn tại` });
    }
    if (sizeInfo.stock < quantity) {
      return res.status(400).json({ message: `Size "${size}" chỉ còn ${sizeInfo.stock} sản phẩm` });
    }
  } catch {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  const objectProductId = new mongoose.Types.ObjectId(productId);

  const cart = await Cart.findOneAndUpdate(
    {
      userId: req.userId,
      items: { $elemMatch: { productId: objectProductId, size } },
    },
    { $set: { "items.$.quantity": quantity } },
    { new: true }
  );

  if (!cart) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
  }

  return res.status(200).json({ message: "Cập nhật số lượng thành công", cart });
});

// Xóa một item khỏi giỏ hàng
export const destroy = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, size } = req.params;

  const objectProductId = new mongoose.Types.ObjectId(productId);

  const cart = await Cart.findOneAndUpdate(
    { userId: req.userId },
    { $pull: { items: { productId: objectProductId, size } } },
    { new: true }
  );

  if (!cart) {
    return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
  }

  return res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng", cart });
});

//Internal controller
// Lấy giỏ hàng của user
export const show = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  console.log(id);
  const cart = await Cart.findById(id);
  if (!cart) {
    return res.status(404).json({ message: "Giỏ hàng không tồn tại bên cart service" });
  }
  return res.status(200).json({ message: "Lấy giỏ hàng thành công", cart });
});

//Sau khi đặt hàng, xóa giỏ hàng
export const destroyInternal = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const cart = await Cart.findByIdAndUpdate(id, { $set: { items: [] } }, { new: true });

  if (!cart) {
    return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
  }
  return res.status(200).json({ message: "Đã xóa giỏ hàng", cart });
});