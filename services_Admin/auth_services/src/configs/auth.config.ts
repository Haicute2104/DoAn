/**
 * Auth Configuration
 * 
 * Tất cả config liên quan đến authentication được tập trung ở đây.
 * Có thể override bằng environment variables.
 */

// Helper function để parse duration string thành milliseconds
// Ví dụ: "30d" -> 30 * 24 * 60 * 60 * 1000
const parseDurationToMs = (duration: string, defaultMs: number): number => {
  if (!duration) return defaultMs;
  
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return defaultMs;
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;                    // seconds
    case 'm': return value * 60 * 1000;               // minutes
    case 'h': return value * 60 * 60 * 1000;          // hours
    case 'd': return value * 24 * 60 * 60 * 1000;     // days
    default: return defaultMs;
  }
};

// Helper function để parse duration string thành seconds (cho Redis TTL)
const parseDurationToSeconds = (duration: string, defaultSeconds: number): number => {
  if (!duration) return defaultSeconds;
  
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return defaultSeconds;
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return defaultSeconds;
  }
};

// ============================================
// TOKEN CONFIGURATION
// ============================================

export const tokenConfig = {
  // Access Token - thời gian tồn tại ngắn, dùng cho API calls
  accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE || '1h',
  
  // Refresh Token - thời gian tồn tại dài, dùng để lấy access token mới
  refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE || '30d',
  
  // Activate Account Token
  activateTokenExpire: process.env.ACTIVATE_TOKEN_EXPIRE || '1h',
  
  // Reset Password Token  
  resetPasswordTokenExpire: process.env.RESET_PASSWORD_TOKEN_EXPIRE || '15m',
};

// ============================================
// COOKIE CONFIGURATION
// ============================================

export const cookieConfig = {
  // Cookie max age (tính bằng milliseconds)
  // Phải sync với refreshTokenExpire
  maxAge: parseDurationToMs(
    process.env.COOKIE_MAX_AGE || process.env.REFRESH_TOKEN_EXPIRE || '30d',
    30 * 24 * 60 * 60 * 1000 // default 30 days
  ),
  
  // SameSite policy
  // - "lax": Cho phép cross-site với navigation (recommend cho dev)
  // - "strict": Chỉ same-site requests
  // - "none": Cho phép cross-site (yêu cầu secure: true)
  sameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
  
  // Secure flag - chỉ gửi cookie qua HTTPS
  secure: process.env.NODE_ENV === 'production',
  
  // HttpOnly - không cho JavaScript truy cập cookie
  httpOnly: true,
  
  // Path - cookie available cho path nào
  path: '/',
};

// ============================================
// REDIS TTL CONFIGURATION (seconds)
// ============================================

export const redisTTL = {
  // TTL cho activate account token trong Redis
  activateAccount: parseDurationToSeconds(
    process.env.ACTIVATE_TOKEN_EXPIRE || '1h',
    60 * 60 // default 1 hour
  ),
  
  // TTL cho reset password token trong Redis
  resetPassword: parseDurationToSeconds(
    process.env.RESET_PASSWORD_TOKEN_EXPIRE || '15m',
    15 * 60 // default 15 minutes
  ),
};

// ============================================
// HELPER FUNCTION để tạo cookie options
// ============================================

export const getCookieOptions = () => ({
  httpOnly: cookieConfig.httpOnly,
  secure: cookieConfig.secure,
  sameSite: cookieConfig.sameSite,
  maxAge: cookieConfig.maxAge,
  path: cookieConfig.path,
});

export const getClearCookieOptions = () => ({
  httpOnly: cookieConfig.httpOnly,
  secure: cookieConfig.secure,
  sameSite: cookieConfig.sameSite,
  path: cookieConfig.path,
});



