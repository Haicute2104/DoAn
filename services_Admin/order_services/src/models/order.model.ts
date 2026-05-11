import mongoose, { Document, Schema } from "mongoose";

/* =====================================================
   ENUMS (chuẩn production, tránh dùng string bừa)
===================================================== */

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled"
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded"
}

export enum ShippingMethod {
  STANDARD = "standard",
  EXPRESS = "express",
  SAME_DAY = "same_day"
}

/* =====================================================
   INTERFACES
===================================================== */

export interface IOrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  subtotal: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  email?: string; // Bổ sung email
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface IStatusHistory {
  status: OrderStatus; // Đã fix: Sửa từ cú pháp Schema của Mongoose thành kiểu enum Typescript
  note?: string;
  updatedBy: string;
  updatedAt: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: string; 

  items: IOrderItem[];

  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  couponId?: string; 
  tax: number;
  totalAmount: number;

  shippingAddress: IShippingAddress;
  shippingMethod: ShippingMethod;
  shippingProvider?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;

  status: OrderStatus;
  statusHistory: IStatusHistory[];

  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paidAt?: Date;

  customerNote?: string;
  adminNote?: string;

  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;

  createdAt: Date;
  updatedAt: Date;
}

/* =====================================================
   SUB SCHEMAS
===================================================== */

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true },
    subtotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }, // Bổ sung thuộc tính email
    street: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: false }, // Cho phép false vì payload gửi lên không có district
    city: { type: String, required: true }
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true
    },
    note: { type: String },
    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

/* =====================================================
   MAIN ORDER SCHEMA
===================================================== */

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    userId: {
      type: String,
      required: true,
      index: true
    },

    items: {
      type: [OrderItemSchema],
      required: true
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },

    couponCode: { type: String },
    couponId: { type: String },

    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    shippingAddress: {
      type: ShippingAddressSchema,
      required: true
    },

    shippingMethod: {
      type: String,
      enum: Object.values(ShippingMethod),
      required: true
    },

    shippingProvider: { type: String },
    trackingNumber: { type: String },
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true
    },

    statusHistory: {
      type: [StatusHistorySchema],
      default: []
    },

    paymentMethod: { type: String, required: true },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },

    paymentId: { type: String },
    paidAt: { type: Date },

    customerNote: { type: String },
    adminNote: { type: String },

    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { type: String }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;