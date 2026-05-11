import api from "../utils/axios";

export const newsServices = {
  createNews: async (data) => {
    try {
      const response = await api.post('/admin/news/create', data);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  getAllNews: async () => {
    try {
      const response = await api.get('/admin/news');
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  getNewsById: async (id) => {
    try {
      const response = await api.get(`/admin/news/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  updateNews: async (id, data) => {
    try {
      const response = await api.put(`/admin/news/${id}`, data);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  deleteNews: async (id) => {
    try {
      const response = await api.delete(`/admin/news/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  changeStatus: async (id, data) => {
    try {
      const response = await api.patch(`/admin/news/${id}/status`, data);
      return { success: true, ...response.data };
    } catch (error) {
      const message = error?.response?.data?.message || "Lỗi kết nối đến server";
      return { success: false, message };
    }
  },
}
