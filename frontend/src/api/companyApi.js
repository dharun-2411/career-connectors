import apiClient from './apiClient';

export const companyApi = {
  getProfile: async () => {
    const response = await apiClient.get('/company/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/company/profile', data);
    return response.data;
  },

  createOpportunity: async (data) => {
    const response = await apiClient.post('/company/opportunities', data);
    return response.data;
  },

  getMyOpportunities: async (page = 0, size = 10) => {
    const response = await apiClient.get(`/company/opportunities?page=${page}&size=${size}`);
    return response.data;
  },

  updateOpportunity: async (id, data) => {
    const response = await apiClient.put(`/company/opportunities/${id}`, data);
    return response.data;
  },

  deleteOpportunity: async (id) => {
    const response = await apiClient.delete(`/company/opportunities/${id}`);
    return response.data;
  },
};
