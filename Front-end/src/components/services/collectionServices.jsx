import api from "../utils/axios";

export const collectionServices = {
  getAllCollections: async () => {
    try {
      const response = await api.get('/admin/collection');
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  createCollection: async (formData) => {
    try {
      const response = await api.post('/admin/collection/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi khi tạo bộ sưu tập", error);
      throw error;
    }
  },

  updateCollection: async (id, formData) => {
    try {
      const response = await api.put(`/admin/collection/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi khi cập nhật bộ sưu tập", error);
      throw error;
    }
  },

  deleteCollection: async (id) => {
    try {
      const response = await api.delete(`/admin/collection/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi khi xóa bộ sưu tập", error);
      throw error;
    }
  },

  getProductByIdCollection: async (id) => {
    try {
      const response = await api.get(`/admin/collection/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi khi lấy sản phẩm theo id bộ sưu tập", error);
      throw error;
    }
  },

  // Lấy sản phẩm khả dụng (chưa thuộc collection nào hoặc đã thuộc collection hiện tại)
  getAvailableProducts: async (id) => {
    try {
      const response = await api.get(`/admin/collection/${id}/available-products`);
      return response.data;
    } catch (error) {
      console.log("Lỗi khi lấy sản phẩm khả dụng", error);
      throw error;
    }
  }
}
