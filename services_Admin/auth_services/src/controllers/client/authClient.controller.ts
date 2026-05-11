import { Request, Response } from "express";
import User from "../../models/user.model";
import { TryCatch } from "../../helpers/tryCatch";
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from "../../helpers/generateToken";
import { publishToTopic } from "../../producer";
import { redisClient } from "../../configs/redis";
import jwt from 'jsonwebtoken';
import { templateActivateAccount } from "../../helpers/templateActivateAccount";
import { 
  tokenConfig, 
  redisTTL, 
  getCookieOptions, 
  getClearCookieOptions 
} from "../../configs/auth.config";
import { templateForgotPassword } from "../../helpers/templateForgotPassword";

const sendActivationEmail = async (userId: string, email: string, fullName: string) => {
  // Xóa token cũ nếu còn tồn tại (invalidate token cũ)
  await redisClient.del(`activate-account:${userId}`);

  const activateToken = jwt.sign(
    { userId, type: 'activate' },
    process.env.JWT_SECRET as string,
    { expiresIn: tokenConfig.activateTokenExpire as jwt.SignOptions["expiresIn"] }
  );

  const activateLink = `${process.env.FRONTEND_URL}/activate-account?token=${activateToken}`;

  // Lưu token mới vào Redis với thời hạn từ config
  await redisClient.set(`activate-account:${userId}`, activateToken, { EX: redisTTL.activateAccount });

  const message = {
    to: email,
    subject: "Kích hoạt tài khoản của bạn",
    html: templateActivateAccount(activateLink, fullName)
  };

  await publishToTopic('send-mail', message);
};


export const existsEmail = async (email: string) => {
  const user = await User.findOne({ email });
  return !!user;
};

export const index = async (req: Request, res: Response) => {
  return res.json({
    message: "Auth client service is running"
  })
}

export const registerUser = TryCatch(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ thông tin"
    })
  }
  if (await existsEmail(email)) {
    return res.status(400).json({
      message: "Email đã tồn tại, vui lòng dùng email khác!"
    })
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    password: hashedPassword,
    fullName
  })
  await user.save();

  await sendActivationEmail(user._id.toString(), email, fullName);

  return res.status(201).json({
    id: user._id,
    message: "Đã tạo tài khoản thành công. Vui lòng kiểm tra email để kích hoạt tài khoản."
  })
})

export const loginUser = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Vui lòng cung cấp đầy đủ thông tin"
    })
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "Email hoặc mật khẩu không chính xác"
    })
  }
  if (user.role !== 'user') {
    return res.status(400).json({
      message: "Tài khoản không phải là người dùng"
    })
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "Mật khẩu không chính xác"
    })
  }
  if (user.isBanned) {
    return res.status(403).json({
      message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
    });
  }
  if (!user.isActive) {
    const existingToken = await redisClient.get(`activate-account:${user._id}`);
  
    if (!existingToken) {
      await sendActivationEmail(user._id.toString(), user.email, user.fullName);
  
      return res.status(400).json({
        message: "Link kích hoạt đã hết hạn. Chúng tôi đã gửi lại email mới.",
        resendActivation: true
      });
    }
  
    return res.status(400).json({
      message: "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.",
      resendActivation: false
    });
  }
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());
  res.cookie("refreshToken", refreshToken, getCookieOptions());
  return res.status(200).json({
    message: "Đăng nhập thành công",
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      role: user.role,
      totalOrder: user.totalOrder,
      totalPrice: user.totalPrice,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  })
})

export const logoutUser = TryCatch(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", getClearCookieOptions());
  return res.status(200).json({
    message: "Đã đăng xuất thành công"
  })
})

export const forgotPassword = TryCatch(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: "Vui lòng cung cấp email"
    })
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "Email không tồn tại"
    })
  }
  if (user.isActive === false) {
    return res.status(400).json({
      message: "Tài khoản chưa được kích hoạt, vui lòng kiểm tra email"
    })
  }
  const resetToken = jwt.sign(
    { userId: user._id.toString(), type: 'reset' },
    process.env.JWT_SECRET as string,
    { expiresIn: tokenConfig.resetPasswordTokenExpire as jwt.SignOptions["expiresIn"] }
  );
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await redisClient.set(`forgot-password:${user._id.toString()}`, resetToken, { EX: redisTTL.resetPassword });
  const message = {
    to: email,
    subject: "Xác nhận đặt lại mật khẩu",
    html: templateForgotPassword(resetLink, user.fullName)
  };
  await publishToTopic('send-mail', message);
  return res.status(200).json({
    message: "Email đã được gửi đi, vui lòng kiểm tra hòm thư của bạn"
  })
})


export const resetPassword = TryCatch(async (req, res, next) => {
  console.log(req.body)
  const { token } = req.params as { token: string };
  console.log(token);

  const { password } = req.body as { password: string };

  interface DecodedToken {
    userId: string;
    type: string;
    iat: number;
    exp: number;
  }

  let decoded: DecodedToken | null = null;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
  } catch (error) {
    return res.status(400).json({
      message: "Token không hợp lệ hoặc hết hạn"
    });
  }

  if (!decoded || decoded.type !== 'reset') {
    return res.status(400).json({
      message: "Token không hợp lệ"
    });
  }

  const id = decoded.userId;

  const storedToken = await redisClient.get(`forgot-password:${id}`);

  if (storedToken !== token) {
    return res.status(400).json({
      message: "Token không hợp lệ"
    });
  }

  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(400).json({
      message: "User không tồn tại"
    });
  }

  if (user.isActive === false) {
    return res.status(400).json({
      message: "Tài khoản chưa được kích hoạt, vui lòng kiểm tra email"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  await redisClient.del(`forgot-password:${id}`);

  return res.json({
    message: "Mật khẩu đã được đặt lại thành công"
  });

});

// Kích hoạt tài khoản
export const activateAccount = TryCatch(async (req, res, next) => {
  const { token } = req.params as { token: string };

  interface DecodedToken {
    userId: string;
    type: string;
    iat: number;
    exp: number;
  }

  let decoded: DecodedToken | null = null;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
  } catch (error) {
    return res.status(400).json({
      message: "Link kích hoạt không hợp lệ hoặc đã hết hạn"
    });
  }

  if (!decoded || decoded.type !== 'activate') {
    return res.status(400).json({
      message: "Link kích hoạt không hợp lệ"
    });
  }

  const userId = decoded.userId;

  // Kiểm tra token trong Redis
  const storedToken = await redisClient.get(`activate-account:${userId}`);

  if (storedToken !== token) {
    return res.status(400).json({
      message: "Link kích hoạt không hợp lệ hoặc đã được sử dụng"
    });
  }

  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(400).json({
      message: "Tài khoản không tồn tại"
    });
  }

  if (user.isActive === true) {
    return res.status(400).json({
      message: "Tài khoản đã được kích hoạt trước đó"
    });
  }

  // Kích hoạt tài khoản
  user.isActive = true;
  await user.save();

  // Xóa token khỏi Redis
  await redisClient.del(`activate-account:${userId}`);

  return res.json({
    message: "Tài khoản đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ."
  });
});

// Gửi lại email kích hoạt
export const resendActivationEmail = TryCatch(async (req, res, next) => {
  const { email } = req.body as { email: string };

  if (!email) {
    return res.status(400).json({
      message: "Vui lòng cung cấp email"
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Email không tồn tại"
    });
  }

  if (user.isActive === true) {
    return res.status(400).json({
      message: "Tài khoản đã được kích hoạt"
    });
  }

  // Gửi lại email kích hoạt
  await sendActivationEmail(user._id.toString(), user.email, user.fullName);

  return res.json({
    message: "Email kích hoạt đã được gửi lại. Vui lòng kiểm tra hòm thư của bạn."
  });
});

export const refreshToken = TryCatch(async (req, res, next) => {
  // Đọc refreshToken từ cookie (httpOnly)
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token không được tìm thấy"
    });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string);
  } catch (err) {
    return res.status(401).json({
      message: "Refresh token không hợp lệ hoặc đã hết hạn"
    });
  }

  // Kiểm tra decoded token có hợp lệ không
  if (!decoded || typeof decoded !== "object") {
    return res.status(401).json({
      message: "Refresh token không hợp lệ"
    });
  }

  // Kiểm tra type nếu có (để tương thích với token cũ và mới)
  if (decoded.type && decoded.type !== "refresh") {
    return res.status(401).json({
      message: "Refresh token không hợp lệ"
    });
  }

  // Lấy userId từ decoded token (có thể là id hoặc userId tùy version)
  const userId = decoded.id || decoded.userId;
  if (!userId) {
    return res.status(401).json({
      message: "Refresh token không hợp lệ"
    });
  }

  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(404).json({
      message: "User không tồn tại"
    });
  }

  if (user.isDeleted) {
    return res.status(403).json({
      message: "Tài khoản đã bị xóa"
    });
  }

  if (user.isBanned) {
    res.clearCookie("refreshToken", getClearCookieOptions());
    return res.status(403).json({
      message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
    });
  }

  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  res.cookie("refreshToken", newRefreshToken, getCookieOptions());

  return res.json({
    message: "Token đã được làm mới thành công",
    accessToken: newAccessToken,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      role: user.role,
      totalOrder: user.totalOrder,
      totalPrice: user.totalPrice,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});