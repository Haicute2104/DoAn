import { TryCatch } from "../../helpers/tryCatch";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import Collection from "../../models/collection.model";
import Product from "../../models/product.model";
export const index = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const collections = await Collection.find({
  }).sort({ createdAt: -1 });
  return res.status(200).json({
    message: "Tất cả bộ sưu tập đã có",
    collections,
  });
})
export const create = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, image, imageId, isActive, isFeatured } = req.body;
    //Kiểm tra xem tên bộ sưu tập đã tồn tại không
    const existingCollection = await Collection.findOne({ name });
    if (existingCollection) {
      return res.status(400).json({ message: "Tên bộ sưu tập đã tồn tại" });
    }
    //Tạo bộ sưu tập mới
    const collection = new Collection({ name, description, image, imageId, isActive, isFeatured });

    await collection.save();
    return res.status(201).json({
      message: "Bộ sưu tập đã được tạo thành công",
      collection,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi tạo bộ sưu tập" });
  }
})
//Cập nhật bộ sưu tập
export const update = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { name, description, image, imageId, thumbnail, isActive, isFeatured, ids } = req.body;
    
    //Kiểm tra xem bộ sưu tập có tồn tại không
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Bộ sưu tập không tồn tại" });
    }

    // Lấy imageId cũ để frontend có thể xóa trên cloud nếu cần
    const oldImageId = collection.imageId;
    
    //Cập nhật thông tin bộ sưu tập
    const updatedCollection = await Collection.findByIdAndUpdate(
      id, 
      { name, description, image, imageId, thumbnail, isActive, isFeatured }, 
      { new: true }
    );
    
    //Nếu có ids sản phẩm được truyền vào, cập nhật collection cho các sản phẩm
    if (ids && Array.isArray(ids)) {
      if (ids.length > 0) {
        // Xóa collection khỏi các sản phẩm cũ (không còn trong danh sách mới)
        await Product.updateMany(
          { collection: id, _id: { $nin: ids } },
          { $unset: { collection: "" } }
        );
        
        // Gán collection cho các sản phẩm mới
        await Product.updateMany(
          { _id: { $in: ids } },
          { $set: { collection: id } }
        );
      } else {
        // Nếu ids là mảng rỗng, xóa tất cả sản phẩm khỏi collection
        await Product.updateMany(
          { collection: id },
          { $unset: { collection: "" } }
        );
      }
    }
    
    return res.status(200).json({ 
      message: "Bộ sưu tập đã được cập nhật thành công", 
      collection: updatedCollection 
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi cập nhật bộ sưu tập" });
  }
})
export const destroy = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    //Kiểm tra xem bộ sưu tập có tồn tại không
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Bộ sưu tập không tồn tại" });
    }
    //Xóa bộ sưu tập
    await Collection.deleteOne({ _id: id });
    //Xóa các sản phẩm khỏi bộ sưu tập
    await Product.updateMany({ collection: id }, { $unset: { collection: "" } });
    return res.status(200).json({ message: "Bộ sưu tập đã được xóa thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi xóa bộ sưu tập" });
  }
})

export const getProductByIdCollection = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Bộ sưu tập không tồn tại" });
    }
    const products = await Product.find({ collection: id });
    return res.status(200).json({ message: "Sản phẩm đã có", products });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi lấy sản phẩm theo id bộ sưu tập" });
  }
})

// Lấy sản phẩm khả dụng cho collection (chưa thuộc collection nào hoặc đã thuộc collection hiện tại)
export const getAvailableProducts = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    
    // Lấy sản phẩm chưa thuộc collection nào hoặc đã thuộc collection hiện tại
    const products = await Product.find({
      isDeleted: { $ne: true },
      $or: [
        { collection: null },
        { collection: id }
      ]
    });
    
    return res.status(200).json({ 
      message: "Danh sách sản phẩm khả dụng", 
      products 
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm khả dụng" });
  }
})