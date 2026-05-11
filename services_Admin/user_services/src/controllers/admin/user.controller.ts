import { TryCatch } from "../../helpers/tryCatch";
import User from "../../models/user.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import axios from "axios";

// Các role được phép quản lý trong admin panel
const ADMIN_ROLES = ['admin', 'staff'];

// Kiểm tra user hiện tại có phải admin không
export const checkRole = (role: string): boolean => {
  return role === 'admin';
}

// Lấy tất cả tài khoản admin/staff (không bao gồm user thường)
export const index = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const users = await User.find({
    role: { $in: ADMIN_ROLES },
    isDeleted: false,
  }).select('-password');

  return res.status(200).json({
    message: "Danh sách tài khoản admin",
    users,
  });
});

// Lấy một tài khoản admin/staff theo ID
export const show = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const id: string = req.params.id;
  const user = await User.findById(id).select('-password');

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return res.status(404).json({
      message: "Tài khoản admin không tồn tại",
    });
  }

  return res.status(200).json({
    message: "Thông tin tài khoản admin",
    user,
  });
});

// Tạo mới tài khoản staff (chỉ admin mới được tạo)
export const create = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const { fullName, email, password, phone, dateOfBirth, gender } = req.body as {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
  };

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      message: "Email đã được sử dụng",
    });
  }

  const newUser = new User({
    fullName,
    email,
    password: await bcrypt.hash(password, 10),
    phone,
    dateOfBirth,
    gender,
    role: 'staff', // Luôn tạo với role staff
    isActive: true, // Admin tạo thì tài khoản tự động active
  });

  await newUser.save();

  const userResponse = newUser.toObject();
  delete (userResponse as any).password;

  return res.status(201).json({
    message: "Tài khoản staff đã được tạo thành công",
    user: userResponse,
  });
});

// Cập nhật tài khoản admin/staff
export const update = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const idUpdate = req.params.id;
  const userUpdate = await User.findById(idUpdate);

  if (!userUpdate || !ADMIN_ROLES.includes(userUpdate.role)) {
    return res.status(404).json({
      message: "Tài khoản admin không tồn tại",
    });
  }

  const { fullName, email, password, phone, avatarUrl, avatarPublicId, dateOfBirth, gender } = req.body as {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    avatarUrl: string;
    avatarPublicId: string;
    dateOfBirth: string;
    gender: string;
  };

  // Kiểm tra email trùng (trừ chính user đang update)
  if (email && email !== userUpdate.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email đã được sử dụng",
      });
    }
  }

  if (fullName) userUpdate.fullName = fullName;
  if (email) userUpdate.email = email;
  if (password) {
    userUpdate.password = await bcrypt.hash(password, 10);
  }
  if (phone !== undefined) userUpdate.phone = phone;
  if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
  if (avatarPublicId !== undefined) userUpdate.avatarPublicId = avatarPublicId;
  if (dateOfBirth !== undefined) userUpdate.dateOfBirth = dateOfBirth;
  if (gender !== undefined) userUpdate.gender = gender;
  // Không cho phép thay đổi role

  await userUpdate.save();

  const userResponse = userUpdate.toObject();
  delete (userResponse as any).password;

  return res.status(200).json({
    message: "Tài khoản admin đã được cập nhật thành công",
    user: userResponse,
  });
});

// Xóa tài khoản admin/staff (soft delete)
export const destroy = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const idDestroy = req.params.id;

  // Không cho phép admin tự xóa chính mình
  if (idDestroy === req.userId) {
    return res.status(400).json({
      message: "Bạn không thể xóa chính mình",
    });
  }

  const userDestroy = await User.findById(idDestroy);

  if (!userDestroy || !ADMIN_ROLES.includes(userDestroy.role)) {
    return res.status(404).json({
      message: "Tài khoản admin không tồn tại",
    });
  }

  await userDestroy.updateOne({ isDeleted: true, deleteAt: new Date() });

  return res.status(200).json({
    message: "Tài khoản admin đã được xóa thành công",
  });
});

// ========== QUẢN LÝ TÀI KHOẢN USER ==========

// Lấy tất cả tài khoản user (role = 'user')
export const indexUsers = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const users = await User.find({
    role: 'user',
    isDeleted: false,
  }).select('-password');

  return res.status(200).json({
    message: "Danh sách tài khoản user",
    users,
  });
});

// Lấy chi tiết một tài khoản user + thống kê đơn hàng
export const showUser = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const id: string = req.params.id;
  const user = await User.findById(id).select('-password');

  if (!user || user.role !== 'user') {
    return res.status(404).json({
      message: "Tài khoản user không tồn tại",
    });
  }

  let orderStats = { totalOrder: 0, totalPrice: 0, totalCancelOrder: 0, statement: [] as Record<string, unknown>[] };
  try {
    const orderUrl = `${process.env.ORDER_SERVICE_URL}/internal/order/statement/${id}`;
    const orderRes = await axios.get(orderUrl);
    orderStats = orderRes.data;
  } catch (err) {
    console.error(`[showUser] Lỗi lấy đơn hàng từ order_services:`, (err as { message?: string })?.message);
  }

  return res.status(200).json({
    message: "Thông tin tài khoản user",
    user,
    totalOrder: orderStats.totalOrder,
    totalPrice: orderStats.totalPrice,
    totalCancelOrder: orderStats.totalCancelOrder,
    orders: orderStats.statement,
  });
});

// Khóa tài khoản user
export const banUser = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const id: string = req.params.id;
  const user = await User.findById(id);

  if (!user || user.role !== 'user') {
    return res.status(404).json({
      message: "Tài khoản user không tồn tại",
    });
  }

  if (user.isBanned) {
    return res.status(400).json({
      message: "Tài khoản đã bị khóa trước đó",
    });
  }

  await user.updateOne({ isBanned: true });

  return res.status(200).json({
    message: "Khóa tài khoản thành công",
  });
});

// Mở khóa tài khoản user
export const unbanUser = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser || !checkRole(currentUser.role)) {
    return res.status(403).json({
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }

  const id: string = req.params.id;
  const user = await User.findById(id);

  if (!user || user.role !== 'user') {
    return res.status(404).json({
      message: "Tài khoản user không tồn tại",
    });
  }

  if (!user.isBanned) {
    return res.status(400).json({
      message: "Tài khoản chưa bị khóa",
    });
  }

  await user.updateOne({ isBanned: false });

  return res.status(200).json({
    message: "Mở khóa tài khoản thành công",
  });
});