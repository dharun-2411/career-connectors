import apiClient from './apiClient';

export const applicationApi = {
  apply: async (opportunityId, coverLetter, resumeUrl = null, resumeFileName = null) => {
    const payload = {
      opportunityId,
      coverLetter,
    };
    if (resumeUrl) payload.resumeUrl = resumeUrl;
    if (resumeFileName) payload.resumeFileName = resumeFileName;
    const response = await apiClient.post('/applications', payload);
    return response.data;
  },

  getMyApplications: async (page = 0, size = 10) => {
    const response = await apiClient.get(`/applications/my?page=${page}&size=${size}`);
    return response.data;
  },

  getOpportunityApplicants: async (opportunityId, page = 0, size = 10) => {
    const response = await apiClient.get(`/applications/opportunity/${opportunityId}?page=${page}&size=${size}`);
    return response.data;
  },

  getAllCompanyApplicants: async (page = 0, size = 10) => {
    const response = await apiClient.get(`/applications/company?page=${page}&size=${size}`);
    return response.data;
  },

  updateStatus: async (applicationId, status) => {
    const response = await apiClient.patch(`/applications/${applicationId}/status`, {
      status,
    });
    return response.data;
  },
};
