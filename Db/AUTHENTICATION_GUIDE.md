# 🔐 Authentication Guide - Bcrypt & JWT Implementation

## 📋 Mục Lục
- [Tổng Quan](#tổng-quan)
- [Bcrypt Implementation](#bcrypt-implementation)
- [JWT Implementation](#jwt-implementation)
- [Security Best Practices](#security-best-practices)
- [Code Examples](#code-examples)

---

## 🎯 Tổng Quan

Hệ thống sử dụng **Bcrypt** để hash mật khẩu và **JWT** (JSON Web Tokens) cho authentication và authorization.

### Công Nghệ
- **Password Hashing**: Bcrypt (salt rounds: 10-12)
- **Token Generation**: JWT (jsonwebtoken)
- **Token Storage**: 
  - Access Token: Memory/HttpOnly Cookie
  - Refresh Token: Database (users collection)

---

## 🔒 Bcrypt Implementation

### 1. Cài Đặt

```bash
npm install bcrypt
npm install @types/bcrypt --save-dev  # For TypeScript
```

### 2. Hash Password

```typescript
import * as bcrypt from 'bcrypt';

const saltRounds = 10; // Recommended: 10-12

/**
 * Hash password với bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}
```

### 3. Verify Password

```typescript
/**
 * Verify password với bcrypt
 * @param password - Plain text password từ user input
 * @param hashedPassword - Hashed password từ database
 * @returns true nếu password đúng, false nếu sai
 */
async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    return false;
  }
}
```

### 4. Password Strength Validation

```typescript
/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - Optional: Special characters
 */
function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }

  // Optional: Special characters
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## 🎫 JWT Implementation

### 1. Cài Đặt

```bash
npm install jsonwebtoken
npm install @types/jsonwebtoken --save-dev  # For TypeScript
```

### 2. JWT Configuration

```typescript
// config/jwt.config.ts

export const JWT_CONFIG = {
  // Access Token
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
  ACCESS_TOKEN_EXPIRES_IN: '1h', // 15 minutes - 1 hour

  // Refresh Token
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  REFRESH_TOKEN_EXPIRES_IN: '7d', // 7-30 days

  // Email Verification Token
  EMAIL_VERIFICATION_SECRET: process.env.JWT_EMAIL_SECRET || 'your-email-secret-key',
  EMAIL_VERIFICATION_EXPIRES_IN: '24h',

  // Password Reset Token
  PASSWORD_RESET_SECRET: process.env.JWT_PASSWORD_RESET_SECRET || 'your-password-reset-secret-key',
  PASSWORD_RESET_EXPIRES_IN: '1h',
};
```

### 3. Generate Access Token

```typescript
import * as jwt from 'jsonwebtoken';
import { JWT_CONFIG } from './config/jwt.config';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT access token
 */
function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    JWT_CONFIG.ACCESS_TOKEN_SECRET,
    {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}
```

### 4. Generate Refresh Token

```typescript
/**
 * Generate JWT refresh token
 */
function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh', // Distinguish from access token
    },
    JWT_CONFIG.REFRESH_TOKEN_SECRET,
    {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
}
```

### 5. Verify Access Token

```typescript
/**
 * Verify JWT access token
 */
function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(
      token,
      JWT_CONFIG.ACCESS_TOKEN_SECRET
    ) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token đã hết hạn');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token không hợp lệ');
    }
    throw new Error('Lỗi xác thực token');
  }
}
```

### 6. Verify Refresh Token

```typescript
/**
 * Verify JWT refresh token
 */
function verifyRefreshToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(
      token,
      JWT_CONFIG.REFRESH_TOKEN_SECRET
    ) as JWTPayload & { type: string };

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token đã hết hạn');
    }
    throw new Error('Refresh token không hợp lệ');
  }
}
```

---

## 🔐 Complete Authentication Service Example

### Express.js Implementation

```typescript
// services/auth-service/src/services/auth.service.ts

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { JWT_CONFIG } from '../config/jwt.config';

export class AuthService {
  private readonly saltRounds = 10;

  /**
   * Register new user
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) {
    // 1. Validate password strength
    const passwordValidation = this.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // 2. Check if email/username already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      throw new Error('Email hoặc username đã tồn tại');
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.saltRounds
    );

    // 4. Generate email verification token
    const emailVerificationToken = jwt.sign(
      { email: userData.email },
      JWT_CONFIG.EMAIL_VERIFICATION_SECRET,
      { expiresIn: JWT_CONFIG.EMAIL_VERIFICATION_EXPIRES_IN }
    );

    // 5. Create user
    const user = new User({
      ...userData,
      password: hashedPassword,
      emailVerificationToken,
      status: 'inactive', // Inactive until email verified
      emailVerified: false,
    });

    await user.save();

    // 6. Send verification email (async)
    // await this.sendVerificationEmail(user.email, emailVerificationToken);

    return {
      userId: user._id.toString(),
      email: user.email,
      emailVerified: false,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // 2. Check account status
    if (user.status === 'banned') {
      throw new Error('Tài khoản đã bị khóa');
    }

    if (user.status === 'inactive') {
      throw new Error('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.');
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // 4. Generate tokens
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // 5. Store refresh token in database
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // 6. Return user info and tokens
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    // 1. Verify refresh token
    const decoded = this.verifyRefreshToken(refreshToken);

    // 2. Check if token exists in database
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Refresh token không hợp lệ');
    }

    // 3. Generate new access token
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = this.generateAccessToken(payload);

    // Optional: Rotate refresh token
    // const newRefreshToken = this.generateRefreshToken(payload);
    // user.refreshToken = newRefreshToken;
    // await user.save();

    return {
      accessToken: newAccessToken,
      // refreshToken: newRefreshToken, // If rotating
    };
  }

  /**
   * Logout
   */
  async logout(userId: string) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    return { success: true };
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists (security)
      return { success: true };
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id.toString() },
      JWT_CONFIG.PASSWORD_RESET_SECRET,
      { expiresIn: JWT_CONFIG.PASSWORD_RESET_EXPIRES_IN }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email (async)
    // await this.sendPasswordResetEmail(user.email, resetToken);

    return { success: true };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    // 1. Verify token
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(
        token,
        JWT_CONFIG.PASSWORD_RESET_SECRET
      ) as { userId: string };
    } catch (error) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }

    // 2. Find user
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }

    // 3. Validate new password
    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

    // 5. Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 6. Invalidate all refresh tokens (optional)
    user.refreshToken = undefined;
    await user.save();

    return { success: true };
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    // 1. Verify token
    let decoded: { email: string };
    try {
      decoded = jwt.verify(
        token,
        JWT_CONFIG.EMAIL_VERIFICATION_SECRET
      ) as { email: string };
    } catch (error) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }

    // 2. Find and update user
    const user = await User.findOne({
      email: decoded.email,
      emailVerificationToken: token,
    });

    if (!user) {
      throw new Error('Token không hợp lệ');
    }

    user.emailVerified = true;
    user.status = 'active';
    user.emailVerificationToken = undefined;
    await user.save();

    return { success: true };
  }

  // Helper methods
  private validatePasswordStrength(password: string) {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private generateAccessToken(payload: {
    userId: string;
    email: string;
    role: string;
  }): string {
    return jwt.sign(payload, JWT_CONFIG.ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  private generateRefreshToken(payload: {
    userId: string;
    email: string;
    role: string;
  }): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      JWT_CONFIG.REFRESH_TOKEN_SECRET,
      {
        expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      }
    );
  }

  private verifyRefreshToken(token: string): {
    userId: string;
    email: string;
    type: string;
  } {
    try {
      const decoded = jwt.verify(
        token,
        JWT_CONFIG.REFRESH_TOKEN_SECRET
      ) as { userId: string; email: string; type: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token đã hết hạn');
      }
      throw new Error('Refresh token không hợp lệ');
    }
  }
}
```

### Express Middleware for JWT Authentication

```typescript
// middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token không được cung cấp',
      },
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_CONFIG.ACCESS_TOKEN_SECRET
    ) as { userId: string; email: string; role: string };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token đã hết hạn',
        },
      });
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token không hợp lệ',
      },
    });
  }
}

// Role-based authorization middleware
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Chưa đăng nhập',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Không có quyền truy cập',
        },
      });
    }

    next();
  };
}
```

---

## 🛡️ Security Best Practices

### 1. Environment Variables

```env
# .env

# JWT Secrets (use strong random strings in production)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EMAIL_SECRET=your-super-secret-email-key-change-in-production
JWT_PASSWORD_RESET_SECRET=your-super-secret-password-reset-key-change-in-production

# Bcrypt
BCRYPT_SALT_ROUNDS=10
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Login rate limiter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.',
});

// Register rate limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
});
```

### 3. Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Special characters recommended (optional)

### 4. Token Storage

- **Access Token**: Store in memory (React state) or HttpOnly cookie
- **Refresh Token**: Store in database (users collection) or Redis
- **Never** store tokens in localStorage (XSS vulnerability)

### 5. HTTPS Only

- Always use HTTPS in production
- Set `secure: true` for cookies in production

### 6. Token Expiry

- **Access Token**: Short-lived (15 minutes - 1 hour)
- **Refresh Token**: Longer-lived (7-30 days)
- Implement token rotation for refresh tokens

---

## 📝 Summary

### Bcrypt
- ✅ Use salt rounds: 10-12
- ✅ Hash passwords on registration
- ✅ Compare passwords on login
- ✅ Never store plain text passwords

### JWT
- ✅ Use different secrets for different token types
- ✅ Set appropriate expiry times
- ✅ Store refresh tokens securely
- ✅ Implement token refresh mechanism
- ✅ Validate tokens on every request

### Security
- ✅ Validate password strength
- ✅ Implement rate limiting
- ✅ Use HTTPS in production
- ✅ Store tokens securely
- ✅ Handle errors gracefully (don't reveal sensitive info)

---

**Tài liệu này sẽ được cập nhật khi có thay đổi.**




