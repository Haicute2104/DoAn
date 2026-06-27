import api from "../utils/axios";

export const categoryServices = {
  getAllCategory: async () => {
    try {
      const response = await api.get('/admin/categories');
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  createCategory: async (formData) => {
    try {
      const response = await api.post('/admin/categories/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  updateCategory: async (id, formData) => {
    try {
      const response = await api.put(`/admin/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },
}