import api from "../utils/axios";

export const reportServices = {
  getDashboard: async () => {
    const response = await api.get("/admin/report/dashboard");
    return response.data;
  },

  getRevenue: async (params = {}) => {
    const response = await api.get("/admin/report/revenue", { params });
    return response.data;
  },

  getRevenueByCategory: async (params = {}) => {
    const response = await api.get("/admin/report/revenue/by-category", { params });
    return response.data;
  },

  getRevenueByPayment: async (params = {}) => {
    const response = await api.get("/admin/report/revenue/by-payment", { params });
    return response.data;
  },

  getOrderStats: async (params = {}) => {
    const response = await api.get("/admin/report/orders", { params });
    return response.data;
  },
};
