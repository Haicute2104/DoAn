import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useAutoRefreshToken } from "../hooks/useAutoRefreshToken";
import { Spin } from "antd";

/**
 * AuthProvider - Component khởi tạo authentication khi app load
 *
 * Chức năng:
 * 1. Gọi refresh-token API để lấy accessToken mới từ refreshToken cookie khi reload trang
 * 2. Chạy auto refresh token mỗi 55 phút để giữ user luôn đăng nhập
 */
export function AuthProvider({ children }) {
  const { initialize, isInitialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Hook tự động refresh token mỗi 55 phút
  useAutoRefreshToken();

  useEffect(() => {
    const initAuth = async () => {
      // Nếu đã khởi tạo rồi thì không cần gọi lại
      if (isInitialized) {
        setIsLoading(false);
        return;
      }

      try {
        // Luôn thử initialize để restore token từ sessionStorage hoặc refresh token
        await initialize();
      } catch (error) {
        // Nếu không có refreshToken hoặc hết hạn, không làm gì
        console.log("No valid refresh token found", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [initialize, isInitialized]);

  // Hiển thị loading khi đang kiểm tra authentication
  if (isLoading) {
    return (
      <Spin size="large" tip="Đang tải..." spinning={isLoading}>
        <div
          style={{
            height: "100vh",
          }}
        />
      </Spin>
    );
  }

  return children;
}
