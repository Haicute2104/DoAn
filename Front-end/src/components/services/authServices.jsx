import api from '../utils/axios';

export const authServices = {
  login: async (email, password) => {
    try {
      const response = await api.post('/admin/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  register: async (fullName, email, password) => {
    try {
      const response = await api.post('/admin/auth/register', { fullName, email, password });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  activeAccount: async (token) => {
    try {
      const response = await api.get(`/admin/auth/activate/${token}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try{
      const response = await api.post('/admin/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },
  resetPassword: async (token, password) => {
    try {
      const response = await api.post(
        `/admin/auth/reset-password/${token}`,
        {
          password: password
        }
      );
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      // RefreshToken được gửi tự động qua cookie (withCredentials: true)
      const response = await api.post('/admin/auth/refresh-token', {});
      return response.data;
    } catch (error) {
      console.log("Lỗi refresh token", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/admin/auth/logout');
      return response.data;
    } catch (error) {
      console.log("Lỗi logout", error);
      throw error;
    }
  }
} 