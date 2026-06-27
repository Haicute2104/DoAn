import { TryCatch } from "../../helpers/tryCatch";
import Category from "../../models/category.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import Product from "../../models/product.model";
import axios from "axios";
const FormData = require("form-data") as typeof import("form-data");

type MulterFile = Express.Multer.File;

const uploadImageToCloud = async (file: MulterFile): Promise<{ url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append("files", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
  const uploadRes = await axios.post(`${process.env.CLOUDINARY_URL}/upload-multiple`, formData, {
    headers: formData.getHeaders(),
  });
  return uploadRes.data.data[0] as { url: string; public_id: string };
};

const deleteFromCloud = async (publicId: string): Promise<void> => {
  try {
    await axios.post(`${process.env.CLOUDINARY_URL}/delete-images`, { public_ids: [publicId] });
  } catch {
    // Không chặn luồng chính
  }
};

export const index = TryCatch( async (req: AuthRequest, res: Response, next: NextFunction) => {
  const categories = await Category.find({
    isDeleted: false,
  }).sort({ createdAt: -1 }).lean();

  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
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
  const { name, description, icon } = req.body;

  let image: string | undefined;
  let imageId: string | undefined;
  const file = (req as AuthRequest & { file?: MulterFile }).file;
  if (file) {
    const uploaded = await uploadImageToCloud(file);
    image = uploaded.url;
    imageId = uploaded.public_id;
  }

  const category = new Category({ name, description, image, imageId, icon });
  await category.save();
  return res.status(201).json({
    message: "Danh mục đã được tạo",
    category,
  });
});

export const update = TryCatch( async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;

  const existingCategory = await Category.findById(id);
  if (!existingCategory) {
    return res.status(404).json({
      message: "Danh mục không tồn tại",
    });
  }

  let image = existingCategory.image;
  let imageId = existingCategory.imageId;
  const file = (req as AuthRequest & { file?: MulterFile }).file;
  if (file) {
    if (existingCategory.imageId) {
      await deleteFromCloud(existingCategory.imageId);
    }
    const uploaded = await uploadImageToCloud(file);
    image = uploaded.url;
    imageId = uploaded.public_id;
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { name, description, image, imageId, icon },
    { new: true }
  );

  return res.status(200).json({
    message: "Danh mục đã được cập nhật",
    category,
  });
});

export const destroy = TryCatch( async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      message: "Danh mục không tồn tại",
    });
  }

  const productCount = await Product.countDocuments({ 
    category: id, 
    isDeleted: false 
  });

  if (productCount > 0) {
    return res.status(400).json({
      message: `Không thể xóa danh mục này vì còn ${productCount} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
      productCount,
    });
  }

  if (category.imageId) {
    await deleteFromCloud(category.imageId);
  }

  await Category.updateOne(
    { _id: id },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );

  return res.status(200).json({
    message: "Danh mục đã được xóa",
  });
});
