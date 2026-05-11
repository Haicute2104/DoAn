import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * useAutoRefreshToken - Hook tự động refresh accessToken trước khi hết hạn
 * 
 * Flow:
 * - accessToken có thời hạn 1 giờ (60 phút)
 * - Hook này chạy interval mỗi 55 phút để refresh token
 * - Đảm bảo user không bị gián đoạn khi sử dụng app
 * 
 * Tính năng:
 * - Chỉ chạy khi user đã đăng nhập (có accessToken)
 * - Tự động dừng khi user logout
 * - Xử lý lỗi refresh và logout nếu token hết hạn hoàn toàn
 */
export function useAutoRefreshToken() {
  const { accessToken, refreshAccessToken, logout } = useAuthStore();
  const intervalRef = useRef(null);
  
  // 55 phút = 55 * 60 * 1000 ms = 3,300,000 ms
  const REFRESH_INTERVAL = 55 * 60 * 1000;

  useEffect(() => {
    // Nếu không có accessToken (chưa đăng nhập), không cần chạy interval
    if (!accessToken) {
      // Clear interval nếu có
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Function để refresh token
    const doRefresh = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('[AutoRefresh] Failed to refresh token:', error);
        
        // Nếu refresh thất bại (token hết hạn hoàn toàn), logout user
        const errorStatus = error?.response?.status;
        if (errorStatus === 401 || errorStatus === 403) {
          await logout();
          // Redirect về trang login
          window.location.href = '/auth';
        }
      }
    };

    // Set interval để refresh token mỗi 55 phút
    intervalRef.current = setInterval(doRefresh, REFRESH_INTERVAL);


    // Cleanup khi component unmount hoặc accessToken thay đổi
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [accessToken, refreshAccessToken, logout]);

  // Hook này không return gì, chỉ chạy side effect
  return null;
}



