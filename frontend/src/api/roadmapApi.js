import apiClient from './apiClient';

export const roadmapApi = {
  // Get all curated and active trending domains
  getTrendingDomains: async () => {
    const response = await apiClient.get('/roadmap/trending-domains');
    return response.data;
  },

  // Search or generate an AI career roadmap for a domain
  searchRoadmap: async (domain) => {
    const response = await apiClient.get('/roadmap/search', {
      params: { domain },
    });
    return response.data;
  },

  // Bookmark / save a roadmap to student profile
  saveRoadmap: async (roadmapId, initialProgressJson = '{}') => {
    const response = await apiClient.post('/roadmap/save', {
      roadmapId,
      initialProgressJson,
    });
    return response.data;
  },

  // Get student's saved roadmaps with progress percentages
  getSavedRoadmaps: async () => {
    const response = await apiClient.get('/roadmap/saved');
    return response.data;
  },

  // Update completed steps and milestone progress
  updateProgress: async (savedId, progressJson) => {
    const response = await apiClient.patch(`/roadmap/saved/${savedId}/progress`, {
      progressJson,
    });
    return response.data;
  },
};
