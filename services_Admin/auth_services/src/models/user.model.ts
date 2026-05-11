import mongoose, { Document, Types } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  gender?: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  isBanned: boolean;
  totalOrder: number;
  totalPrice: number;
  address: {
    street?: string;
    ward?: string;
    city?: string;
    isDefault: boolean;
  }[];
  deleteAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    avatarUrl: String,
    avatarPublicId: String,
    dateOfBirth: String,
    gender: String,
    role: { type: String, default: "user" },

    // KHÔNG lưu refreshToken ở đây nữa
    //Trạng thái tài khoản khi mới đăng ký sẽ có mail gửi về để xác thực tài khoản
    isActive: { type: Boolean, default: false },
    //Trạng thái tài khoản đã bị xóa
    isDeleted: { type: Boolean, default: false },

    //Trạng thái tài khoản đã bị khóa
    isBanned: { type: Boolean, default: false },

    //Tổng số đơn hàng
    totalOrder: { type: Number, default: 0 },
    //Tổng số tiền đã mua
    totalPrice: { type: Number, default: 0 },

    address: [
      {
        street: String,
        ward: String,
        city: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    deleteAt: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "users");
export default User;
