import { create } from 'zustand';
import { authServices } from '../services/authServices';

// Helper functions for sessionStorage
const saveToSession = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
};

const getFromSession = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from sessionStorage:', error);
    return null;
  }
};

const removeFromSession = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from sessionStorage:', error);
  }
};

// Khởi tạo state từ sessionStorage
const initialState = {
  accessToken: getFromSession('accessToken'),
  userId: getFromSession('userId'),
  loading: false,
  isInitialized: false,
};

export const useAuthStore = create((set, get) => ({
  ...initialState,

  // Khởi tạo auth - gọi khi app load để lấy accessToken từ refreshToken cookie
  initialize: async () => {
    const state = get();
    
    // Nếu đã có accessToken trong sessionStorage, sử dụng nó
    const cachedToken = getFromSession('accessToken');
    if (cachedToken) {
      set({
        accessToken: cachedToken,
        userId: getFromSession('userId'),
        isInitialized: true
      });
      return cachedToken;
    }
    
    // Nếu không có, thử refresh token
    try {
      const response = await authServices.refreshToken();
      if (response.accessToken) {
        set({
          accessToken: response.accessToken,
          userId: response.user?.id || null,
          isInitialized: true
        });
        saveToSession('accessToken', response.accessToken);
        saveToSession('userId', response.user?.id || null);
        return response.accessToken;
      }
    } catch (error) {
      console.log('Initialize auth failed:', error);
      set({ accessToken: null, userId: null, isInitialized: true });
      removeFromSession('accessToken');
      removeFromSession('userId');
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true });

      const response = await authServices.login(email, password);
      console.log('Login response:', response);

      // Lưu token vào store và sessionStorage
      if (response && response.accessToken) {
        set({
          accessToken: response.accessToken,
          userId: response.user?.id || null,
          isInitialized: true
        });
        // Persist to sessionStorage
        saveToSession('accessToken', response.accessToken);
        saveToSession('userId', response.user?.id || null);
        console.log('Token saved to store and sessionStorage:', response.accessToken);
      } else {
        console.error('No accessToken in response:', response);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  register: async (fullName, email, password) => {
    try {
      set({ loading: true });
      const response = await authServices.register(fullName, email, password);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  activeAccount: async (token) => {
    try {
      set({ loading: true });
      const response = await authServices.activeAccount(token);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      // Gọi API logout để xóa refreshToken cookie
      await authServices.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Clear state and sessionStorage
      set({ accessToken: null, userId: null, isInitialized: true });
      removeFromSession('accessToken');
      removeFromSession('userId');
    }
  },

  // Refresh accessToken từ refreshToken cookie
  refreshAccessToken: async () => {
    try {
      const response = await authServices.refreshToken();
      
      if (response.accessToken) {
        set({
          accessToken: response.accessToken,
          userId: response.user?.id || null,
          isInitialized: true
        });
        // Persist to sessionStorage
        saveToSession('accessToken', response.accessToken);
        saveToSession('userId', response.user?.id || null);
        return response.accessToken;
      }
    } catch (error) {
      console.log('Refresh token failed:', error);
      set({ accessToken: null, userId: null, isInitialized: true });
      removeFromSession('accessToken');
      removeFromSession('userId');
      throw error;
    }
  },

  // Set accessToken (dùng cho axios interceptor)
  setAccessToken: (token) => {
    set({ accessToken: token });
    saveToSession('accessToken', token);
  },

  // Kiểm tra xem user có đang đăng nhập không
  isAuthenticated: () => {
    const state = get();
    return !!state.accessToken;
  }

}))