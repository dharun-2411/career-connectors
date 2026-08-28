import apiClient from './apiClient';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  registerStudent: async (data) => {
    const response = await apiClient.post('/auth/register/student', data);
    return response.data;
  },

  registerCompany: async (data) => {
    const response = await apiClient.post('/auth/register/company', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
