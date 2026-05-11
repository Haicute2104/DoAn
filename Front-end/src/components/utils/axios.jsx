import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

// const PORT = import.meta.env.VITE_PORT_AUTH;
// const VERSION = import.meta.env.VITE_VERSION;
const DOMAIN = import.meta.env.VITE_DOMAIN;

const API_URL = `${DOMAIN}`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Cho phép gửi cookie
});

// Request interceptor - thêm accessToken vào header
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - tự động refresh token khi hết hạn
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Danh sách các endpoint public - không cần refresh token khi lỗi 401
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/activate',
      '/auth/resend-activation',
      '/auth/refresh-token', // Tránh vòng lặp vô hạn
      '/auth/logout' // Không refresh token khi logout
    ];

    // Kiểm tra xem request có phải là endpoint public không
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // Chỉ refresh token nếu:
    // 1. Lỗi 401
    // 2. Chưa retry
    // 3. Không phải endpoint public
    // 4. Có accessToken trong store (đã đăng nhập trước đó)
    // 5. Không phải lỗi từ chính refresh token endpoint
    const hasAccessToken = !!useAuthStore.getState().accessToken;
    const isRefreshTokenRequest = originalRequest.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !isPublicEndpoint && 
        !isRefreshTokenRequest &&
        hasAccessToken) {
      if (isRefreshing) {
        // Nếu đang refresh, thêm vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh token — phải dùng đúng prefix /admin/auth/ để nginx route đúng
        const response = await axios.post(
          `${API_URL}/admin/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        const userId = response.data.user?.id || null;
        
        // Cập nhật token mới và userId vào store (store sẽ tự động save vào sessionStorage)
        const store = useAuthStore.getState();
        store.setAccessToken(newAccessToken);
        if (userId) {
          useAuthStore.setState({ userId });
          // Save userId to sessionStorage manually since setState doesn't trigger setAccessToken
          try {
            sessionStorage.setItem('userId', JSON.stringify(userId));
          } catch (e) {
            console.error('Error saving userId to sessionStorage:', e);
          }
        }
        
        // Xử lý các request trong queue
        processQueue(null, newAccessToken);
        
        // Retry request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Chỉ logout nếu refresh token thất bại và không phải do:
        // 1. Refresh token đã hết hạn (401)
        // 2. Đang ở trang auth
        const refreshErrorStatus = refreshError?.response?.status;
        
        // Nếu refresh token thất bại (401 hoặc 403), logout user
        // Nhưng không logout nếu đang ở trang auth
        if (refreshErrorStatus === 401 || refreshErrorStatus === 403) {
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.startsWith('/auth') || 
                           currentPath.startsWith('/activate-account') ||
                           currentPath.startsWith('/reset-password');
          
          if (!isAuthPage) {
            useAuthStore.getState().logout();
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Với các lỗi 401 từ endpoint public hoặc khi chưa có accessToken, trả về lỗi trực tiếp
    return Promise.reject(error);
  }
);

export default api;
