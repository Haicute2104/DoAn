import api from "../utils/axios";

export const orderServices = {
  getStatement: async (idUser) => {
    const response = await api.get(`/admin/order/statement/${idUser}`);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/admin/order');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/admin/order/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/admin/order/${id}/status`, status);
    return response.data;
  },
};

