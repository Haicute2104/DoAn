import api from "../utils/axios";

export const shareServices = {
  postUploadImage: async (data) => {
    try {
      const response = await api.post('/upload/multiple', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  // Xóa ảnh trên Cloudinary
  deleteImages: async (publicIds) => {
    try {
      const response = await api.post('/upload/delete-images', {
        public_ids: publicIds
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi xóa ảnh trên Cloudinary", error);
      throw error;
    }
  }
}