import apiClient from './apiClient';

export const opportunityApi = {
  getOpportunities: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.type) query.append('type', params.type);
    if (params.isRemote !== undefined && params.isRemote !== null) query.append('isRemote', params.isRemote);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortDir) query.append('sortDir', params.sortDir);

    const response = await apiClient.get(`/opportunities?${query.toString()}`);
    return response.data;
  },

  getOpportunityDetails: async (id) => {
    const response = await apiClient.get(`/opportunities/${id}`);
    return response.data;
  },
};
