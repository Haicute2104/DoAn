import api from "../utils/axios";

export const userServices = {
  getAllAdminAccounts: async () => {
    try {
      const response = await api.get('/admin/user');
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/user/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  createAdminAccount: async (data) => {
    try {
      const response = await api.post('/admin/user/create', data);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  updateAdminAccount: async (id, data) => {
    try {
      const response = await api.put(`/admin/user/update/${id}`, data);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  deleteAdminAccount: async (id) => {
    try {
      const response = await api.delete(`/admin/user/delete/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  getAllUserAccounts: async () => {
    try {
      const response = await api.get('/admin/user/users');
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  getUserDetail: async (id) => {
    try {
      const response = await api.get(`/admin/user/users/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  banUserAccount: async (id) => {
    try {
      const response = await api.patch(`/admin/user/users/ban/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  unbanUserAccount: async (id) => {
    try {
      const response = await api.patch(`/admin/user/users/unban/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },
}