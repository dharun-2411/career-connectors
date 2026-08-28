import apiClient from './apiClient';

export const adminApi = {
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getStudents: async (search = '', page = 0, size = 10) => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    query.append('page', page);
    query.append('size', size);
    const response = await apiClient.get(`/admin/students?${query.toString()}`);
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status?status=${status}`);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getCompanies: async (search = '', page = 0, size = 10) => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    query.append('page', page);
    query.append('size', size);
    const response = await apiClient.get(`/admin/companies?${query.toString()}`);
    return response.data;
  },

  verifyCompany: async (companyId, verificationStatus, notes) => {
    const response = await apiClient.patch(`/admin/companies/${companyId}/verify`, {
      verificationStatus,
      notes,
    });
    return response.data;
  },

  getOpportunities: async (page = 0, size = 10) => {
    const response = await apiClient.get(`/admin/opportunities?page=${page}&size=${size}`);
    return response.data;
  },

  deleteOpportunity: async (opportunityId) => {
    const response = await apiClient.delete(`/admin/opportunities/${opportunityId}`);
    return response.data;
  },
};
