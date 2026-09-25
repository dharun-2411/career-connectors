import apiClient from './apiClient';

export const aiApi = {
  getMatchScore: async (opportunityId) => {
    const response = await apiClient.get(`/ai/matching/${opportunityId}`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await apiClient.get('/ai/recommendations');
    return response.data;
  },

  getSkillGap: async (opportunityId) => {
    const url = opportunityId ? `/ai/skill-gap/${opportunityId}` : '/ai/skill-gap';
    const response = await apiClient.get(url);
    return response.data;
  },

  rankApplicants: async (opportunityId) => {
    const response = await apiClient.get(`/ai/applicant-ranking/${opportunityId}`);
    return response.data;
  },

  getCareerSuggestions: async () => {
    const response = await apiClient.get('/ai/career-suggestions');
    return response.data;
  },

  submitFeedback: async (feedbackData) => {
    const response = await apiClient.post('/ai/feedback', feedbackData);
    return response.data;
  },
};
