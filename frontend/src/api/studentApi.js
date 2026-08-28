import apiClient from './apiClient';

export const studentApi = {
  getProfile: async () => {
    const response = await apiClient.get('/student/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/student/profile', data);
    return response.data;
  },

  getSkills: async () => {
    const response = await apiClient.get('/student/skills');
    return response.data;
  },

  addSkill: async (skillData) => {
    const response = await apiClient.post('/student/skills', skillData);
    return response.data;
  },

  removeSkill: async (skillId) => {
    const response = await apiClient.delete(`/student/skills/${skillId}`);
    return response.data;
  },

  updateSkillProficiency: async (skillId, proficiency) => {
    const response = await apiClient.patch(`/student/skills/${skillId}/proficiency?proficiency=${proficiency}`);
    return response.data;
  },
};
