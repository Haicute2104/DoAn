import { NextFunction } from "express";
import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

// Interface cho Collection (Bộ sưu tập)
export interface ICollection extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageId?: string;
  isActive: boolean;
  isFeatured: boolean; // Bộ sưu tập nổi bật
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      type: String, // Banner lớn cho collection
    },
    imageId: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    }

  },
  { timestamps: true }
);

// Middleware tự động tạo slug
CollectionSchema.pre('save', function (next) {
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
// Indexes
CollectionSchema.index({ name: 1 }, { unique: true });
CollectionSchema.index({ slug: 1 }, { unique: true });
CollectionSchema.index({ isActive: 1 });
CollectionSchema.index({ isFeatured: 1 });
CollectionSchema.index({ isDeleted: 1 });
const Collection = mongoose.model<ICollection>("Collection", CollectionSchema);
export default Collection;

