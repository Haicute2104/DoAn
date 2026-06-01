import api from '../utils/axios';

export const productServices = {
  getProducts: async (page, limit, category, brand, minPrice, maxPrice, rating, search, sort, inStock, onSale) => {
    try {
      const response = await api.get('/admin/products', {
        params: {
          page,
          limit,
          category,
          brand,
          minPrice,
          maxPrice,
          rating,
          search,
          sort,
          inStock,
          onSale,
          
        }
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  changeStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/products/change-status/${id}`, status)
      return response.data; 
    } catch (error) {   
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  changeMultipleStatus: async (ids, key, value) => {
    try {
      const response = await api.patch(`/admin/products/change-all`, {
        ids,
        key,
        value
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }  
  },

  createProduct: async (formData) => {
    try {
      const response = await api.post('/admin/products/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  updateProduct: async (id, formData) => {
    try {
      const response = await api.put(`/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  getStock: async () =>{
    try {
      const response = await api.get('/admin/products/stock');
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  },

  adjustInventory: async (productId, sizeId, type, quantity) => {
    try {
      const response = await api.patch(`/admin/products/inventory/${productId}/${sizeId}`, { type, quantity });
      return response.data;
    } catch (error) {
      console.log("Lỗi kết nối đến server", error);
      throw error;
    }
  }
}