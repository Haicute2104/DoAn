import mongoose, { Schema, Document, Types } from "mongoose";
import slugify from "slugify";
// --- 1. Interface cho Size & Stock ---
export interface ISizeStock {
  size: string; // VD: "S", "M", "L", "XL", "XXL", "Free Size"
  stock: number; // Tồn kho của size này
  sold: number; // Đã bán được bao nhiêu size này
  _id: Types.ObjectId;
}

// --- 2. Interface cho Thông số kỹ thuật thời trang ---
interface IFashionSpecs {
  material?: string; // Chất liệu: Cotton, Lụa, Vải thun, Polyester...
  origin?: string; // Xuất xứ
  style?: string; // Phong cách: Hiện đại, Truyền thống, Thanh lịch...
  pattern?: string; // Họa tiết: Trơn, Hoa, Kẻ sọc, Chấm bi...
  season?: string; // Mùa phù hợp: Xuân/Hạ, Thu/Đông, Cả năm
  careInstructions?: string; // Hướng dẫn bảo quản
  elasticity?: string; // Độ co giãn: Không co giãn, Co giãn nhẹ, Co giãn tốt
  thickness?: string; // Độ dày: Mỏng, Vừa, Dày
}

// --- 3. Interface Product Chính ---
export interface IProduct extends Omit<Document, 'collection'> {
  name: string;
  slug: string;
  description: string; // HTML từ TinyMCE
  shortDescription?: string; // Plain text hoặc HTML ngắn
  category: Types.ObjectId;
  collection?: Types.ObjectId;



  // Hình ảnh
  images: [
    {
      url: string;
      public_id: string;
    }
  ];
  thumbnail: {
    url: string;
    public_id: string;
  };

  // Giá bán chung cho tất cả size
  price: number;
  originalPrice?: number; // Giá gốc (nếu có khuyến mãi)
  cost: number; // Giá vốn

  // Mảng size và tồn kho
  sizeStock: ISizeStock[];

  // Tổng tồn kho (tự động tính từ sizeStock)
  totalStock: number;
  // Tổng đã bán (tự động tính từ sizeStock)
  totalSold: number;

  // Thông số kỹ thuật
  specs: IFashionSpecs;

  // SEO & Status
  tags: string[];
  seo: {
    title?: string; // Meta title (50-60 ký tự)
    description?: string; // Meta description (150-160 ký tự)
    keywords?: string[]; // Meta keywords
    ogTitle?: string; // Open Graph title cho Facebook
    ogDescription?: string; // Open Graph description
    ogImage?: string; // Open Graph image URL
    canonicalUrl?: string; // URL chuẩn để tránh duplicate content
  };
  rating: {
    average: number;
    count: number;
  };
  gender?: "nam" | "nu" | "unisex"; // Giới tính
  isFeatured: boolean; // Sản phẩm nổi bật
  isNewArrival: boolean; // Hàng mới về
  isBestSeller: boolean; // Bán chạy
  status: "active" | "inactive" | "draft";
  isDeleted: boolean;
  deletedAt?: Date;
}

// --- 4. Schema Definition ---

const SizeStockSchema = new Schema(
  {
    size: { type: String, required: true }, // S, M, L, XL, XXL, Free Size
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0 },
  },
  { _id: true }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String }, // HTML content từ TinyMCE
    shortDescription: { type: String }, // Plain text ngắn gọn
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    collection: { type: Schema.Types.ObjectId, ref: "Collection"},

    // Hình ảnh
    images: [{
      url: String,
      public_id: String,
    }],
    thumbnail: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    // Giá chung
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    cost: { type: Number, required: true, default: 0, min: 0 },

    // Mảng size và tồn kho
    sizeStock: [SizeStockSchema],

    // Tổng tồn kho và tổng đã bán
    totalStock: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },

    // Specs thời trang
    specs: {
      material: { type: String },
      origin: { type: String },
      style: { type: String },
      pattern: { type: String },
      season: { type: String },
      careInstructions: { type: String },
      elasticity: { type: String },
      thickness: { type: String },
    },

    // Tags và SEO
    tags: [String],
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [String],
      ogTitle: { type: String, trim: true },
      ogDescription: { type: String, trim: true },
      ogImage: { type: String },
      canonicalUrl: { type: String },
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    gender: {
      type: String,
      enum: ["nam", "nu", "unisex"],
    },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
      index: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// --- 5. Middleware & Logic ---

ProductSchema.pre('save', function () {
  if (this.isModified('name')) {
    const baseSlug = slugify(this.name as string, {
      lower: true,
      strict: true,
      locale: 'vi',
    });
    const timestamp = Date.now();
    (this as IProduct & { slug: string }).slug = `${baseSlug}-${timestamp}`;
  }

  if (this.isModified('sizeStock') || this.isNew) {
    this.totalStock = this.sizeStock.reduce((sum, item) => sum + (item.stock || 0), 0);
    this.totalSold = this.sizeStock.reduce((sum, item) => sum + (item.sold || 0), 0);
  }
});

// --- 6. Index cho tìm kiếm ---
ProductSchema.index({ name: "text", tags: "text", description: "text" });
ProductSchema.index({ productType: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ gender: 1 });

const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
