import { NextFunction } from "express";
import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageId?: string;
  icon?: string;
  isActive: boolean;
  productCount: number;
  isDeleted: boolean;
  deletedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  imageId: {
    type: String,
  },
  icon: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  productCount: {
    type: Number,
    default: 0,
  },
});

CategorySchema.pre('save', function (next) {
  // Mongoose tự động hiểu 'this' là Document nếu ProductSchema được khởi tạo đúng
  if (!this.isModified('name')) return ;

  const baseSlug = slugify(this.name as string, { // Ép kiểu string nếu TS báo lỗi ở this.name
    lower: true,
    strict: true,
    locale: 'vi',
  });

  const timestamp = Date.now(); // ms

  // Gán slug
  (this as any).slug = `${baseSlug}-${timestamp}`;
});
  
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ isDeleted: 1 });
CategorySchema.index({ productCount: 1 });

const Category = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;