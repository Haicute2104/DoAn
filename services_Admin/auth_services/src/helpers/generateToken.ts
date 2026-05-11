import jwt, { SignOptions, Secret } from "jsonwebtoken";

export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  
  // Default: 1 giờ (theo yêu cầu flow auth)
  const expiresIn = (process.env.ACCESS_TOKEN_EXPIRE || "1h") as jwt.SignOptions["expiresIn"];
  const options: SignOptions = {
    expiresIn,
  };
  
  return jwt.sign({ id: userId }, secret, options);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  
  // Default: 30 ngày (theo yêu cầu flow auth)
  const expiresIn = (process.env.REFRESH_TOKEN_EXPIRE || "30d") as jwt.SignOptions["expiresIn"];
  const options: SignOptions = {
    expiresIn,
  };
  
  // Thêm type: "refresh" để phân biệt với access token
  return jwt.sign({ id: userId, type: "refresh" }, secret, options);
};
