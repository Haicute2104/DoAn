/**
 * MongoDB Schemas cho Hệ Thống Bán Đồ Dùng Thể Thao
 * Sử dụng Mongoose với TypeScript
 * 
 * Cài đặt:
 * npm install mongoose @types/mongoose
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================================
// 1. USER SCHEMA
// ============================================================================

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'staff';
  status: 'active' | 'inactive' | 'banned';
  
  // Authentication
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  
  // Profile
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    ward: string;
    district: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  
  // Badminton preferences
  playingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferredRacketBrand?: string[];
  preferredRacketWeight?: string;
  
  // Statistics
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'staff'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
      index: true,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      street: String,
      ward: String,
      district: String,
      city: String,
      country: { type: String, default: 'Vietnam' },
      postalCode: String,
    },
    playingLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'professional'],
    },
    preferredRacketBrand: [String],
    preferredRacketWeight: String,
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

// ============================================================================
// 2. CATEGORY SCHEMA
// ============================================================================

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: mongoose.Types.ObjectId;
  level: number;
  path?: string;
  displayOrder: number;
  isActive: boolean;
  showInMenu: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
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
    icon: {
      type: String,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: {
      type: Number,
      default: 1,
    },
    path: {
      type: String,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    showInMenu: {
      type: Boolean,
      default: true,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    keywords: [String],
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ displayOrder: 1 });

export const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);

// ============================================================================
// 3. PRODUCT SCHEMA
// ============================================================================

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  brand: string;
  brandSlug?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  discountPercent?: number;
  stock: number;
  sku: string;
  barcode?: string;
  lowStockThreshold: number;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  thumbnail?: string;
  productType?: 'racket' | 'shuttlecock' | 'shoes' | 'clothing' | 'accessories' | 'string' | 'grip' | 'bag' | 'other';
  racketSpecs?: {
    weight?: string;
    balance?: string;
    stringTension?: string;
    frameMaterial?: string;
    shaftFlexibility?: string;
    gripSize?: string;
    length?: number;
  };
  shuttlecockSpecs?: {
    type?: string;
    speed?: string;
    quantity?: number;
    featherGrade?: string;
  };
  shoeSpecs?: {
    size?: string[];
    gender?: string;
    soleMaterial?: string;
    upperMaterial?: string;
    cushioning?: string;
  };
  specifications: Map<string, string>;
  tags: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalSold: number;
  views: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  isActive: boolean;
  relatedProducts: mongoose.Types.ObjectId[];
  frequentlyBoughtTogether: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const ProductSchema: Schema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    brandSlug: {
      type: String,
      lowercase: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    salePrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function(this: IProduct, value: number) {
          return !value || value < this.price;
        },
        message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
      },
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    barcode: {
      type: String,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    images: [{
      url: { type: String, required: true },
      alt: String,
      isPrimary: { type: Boolean, default: false },
    }],
    thumbnail: {
      type: String,
    },
    productType: {
      type: String,
      enum: ['racket', 'shuttlecock', 'shoes', 'clothing', 'accessories', 'string', 'grip', 'bag', 'other'],
      index: true,
    },
    racketSpecs: {
      weight: String,
      balance: String,
      stringTension: String,
      frameMaterial: String,
      shaftFlexibility: String,
      gripSize: String,
      length: Number,
    },
    shuttlecockSpecs: {
      type: String,
      speed: String,
      quantity: Number,
      featherGrade: String,
    },
    shoeSpecs: {
      size: [String],
      gender: String,
      soleMaterial: String,
      upperMaterial: String,
      cushioning: String,
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    keywords: [String],
    metaTitle: String,
    metaDescription: String,
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    ratingDistribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },
    totalSold: {
      type: Number,
      default: 0,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNew: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOnSale: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
      default: 'active',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    relatedProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    frequentlyBoughtTogether: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Other indexes
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ categoryName: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ status: 1, isActive: 1 });
ProductSchema.index({ isFeatured: 1, isNew: 1, isBestSeller: 1 });
ProductSchema.index({ totalSold: -1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ sku: 1 }, { unique: true });

// Compound indexes
ProductSchema.index({ categoryId: 1, status: 1, isActive: 1, price: 1 });
ProductSchema.index({ brand: 1, status: 1, createdAt: -1 });
ProductSchema.index({ isFeatured: 1, isActive: 1, createdAt: -1 });

// Pre-save hook để tính discountPercent
ProductSchema.pre('save', function(next) {
  if (this.salePrice && this.price) {
    this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
    this.isOnSale = true;
  } else {
    this.discountPercent = 0;
    this.isOnSale = false;
  }
  next();
});

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);

// ============================================================================
// 4. ORDER SCHEMA
// ============================================================================

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKED = 'packed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  E_WALLET = 'e_wallet',
  VNPAY = 'vnpay',
  PAYPAL = 'paypal',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage?: string;
  sku: string;
  quantity: number;
  price: number;
  salePrice?: number;
  totalPrice: number;
  specifications?: Map<string, string>;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  postalCode?: string;
  addressId?: mongoose.Types.ObjectId;
}

export interface IStatusHistory {
  status: string;
  note?: string;
  updatedBy: string;
  updatedAt: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  couponId?: mongoose.Types.ObjectId;
  tax: number;
  totalAmount: number;
  shippingAddress: IShippingAddress;
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: mongoose.Types.ObjectId;
  paidAt?: Date;
  shippingMethod: 'standard' | 'express' | 'same_day';
  shippingProvider?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
  customerNote?: string;
  adminNote?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    specifications: {
      type: Map,
      of: String,
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true, default: 'Vietnam' },
    postalCode: String,
    addressId: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
    },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, required: true },
    note: String,
    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function(items: IOrderItem[]) {
          return items && items.length > 0;
        },
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paidAt: {
      type: Date,
    },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'same_day'],
      default: 'standard',
    },
    shippingProvider: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    customerNote: {
      type: String,
      maxlength: 500,
    },
    adminNote: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ userId: 1, status: 1, createdAt: -1 });

// Pre-save hook để generate orderNumber
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await Order.countDocuments({
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`),
      },
    });
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);

// ============================================================================
// 5. CART SCHEMA
// ============================================================================

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  productName?: string;
  productImage?: string;
  price: number;
  salePrice?: number;
  quantity: number;
  specifications?: Map<string, string>;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
    },
    productImage: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    specifications: {
      type: Map,
      of: String,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CartSchema: Schema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CartSchema.index({ userId: 1 }, { unique: true });

// Pre-save hook để tính totals
CartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => {
    const itemPrice = item.salePrice || item.price;
    return sum + itemPrice * item.quantity;
  }, 0);
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  next();
});

export const Cart: Model<ICart> = mongoose.model<ICart>('Cart', CartSchema);

// ============================================================================
// 6. REVIEW SCHEMA
// ============================================================================

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  helpfulCount: number;
  helpfulUsers: mongoose.Types.ObjectId[];
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  adminResponse?: {
    message: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    title: {
      type: String,
      maxlength: 200,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    images: [String],
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    adminResponse: {
      message: String,
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1, status: 1, rating: -1, createdAt: -1 });

export const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);

// ============================================================================
// Export all models
// ============================================================================

export const Models = {
  User,
  Category,
  Product,
  Order,
  Cart,
  Review,
};




