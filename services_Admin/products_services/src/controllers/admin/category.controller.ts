import { TryCatch } from "../../helpers/tryCatch";
import Category from "../../models/category.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import Product from "../../models/product.model";

export const index = TryCatch( async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Lấy tất cả categories
  const categories = await Category.find({
    isDeleted: false,
  }).sort({ createdAt: -1 }).lean();

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      // Đếm trực tiếp số sản phẩm thuộc category này
      const productCount = await Product.countDocuments({
        category: category._id,
        isDeleted: false
      });
      
      return {
        ...category,
        productCount
      };
    })
  );

  // Tính tổng số sản phẩm
  const totalProducts = categoriesWithCount.reduce(
    (sum, cat) => sum + cat.productCount, 
    0
  );

  return res.status(200).json({
    message: "Tất cả danh mục đã có",
    categories: categoriesWithCount,
    totalProducts,
  });
});

export const create = TryCatch( async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, description, image, icon } = req.body;
  const category = new Category({ name, description, image, icon });
  await category.save();
  return res.status(201).json({
    message: "Danh mục đã được tạo",
    category,
  });
});

export const update = TryCatch( async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description, image, icon } = req.body;
  const category = await Category.findByIdAndUpdate(id, { name, description, image, icon }, { new: true });
  return res.status(200).json({
    message: "Danh mục đã được cập nhật",
    category,
  });
});

export const destroy = TryCatch( async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Kiểm tra category có tồn tại không
  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      message: "Danh mục không tồn tại",
    });
  }

  // Đếm số sản phẩm thuộc category này (chưa bị xóa)
  const productCount = await Product.countDocuments({ 
    category: id, 
    isDeleted: false 
  });

  // Không cho phép xóa nếu còn sản phẩm
  if (productCount > 0) {
    return res.status(400).json({
      message: `Không thể xóa danh mục này vì còn ${productCount} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
      productCount,
    });
  }

  // Thực hiện soft delete
  await Category.updateOne(
    { _id: id },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );

  return res.status(200).json({
    message: "Danh mục đã được xóa",
  });
});