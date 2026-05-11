import api from "../utils/axios";

export const contactServices = {
  getContact: async () => {
    try {
      const response = await api.get('/admin/contact');
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },
  updateContact: async (id, data) => {
    try {
      const response = await api.put(`/admin/contact/${id}`, data);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  }
}