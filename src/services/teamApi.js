import api from './api';

export const teamApi = {
  getTeams: async (params = {}) => {
    const { data } = await api.get('/teams', { params });
    return data;
  },
  getTeam: async (id) => {
    const { data } = await api.get(`/teams/${id}`);
    return data;
  },
  createTeam: async (team) => {
    const { data } = await api.post('/teams', team);
    return data;
  },
  updateTeam: async (id, updates) => {
    const { data } = await api.put(`/teams/${id}`, updates);
    return data;
  },
  deleteTeam: async (id) => {
    const { data } = await api.delete(`/teams/${id}`);
    return data;
  },
  reactivateTeam: async (id) => {
    const { data } = await api.patch(`/teams/${id}/reactivate`);
    return data;
  },
  getStats: async (id) => {
    const { data } = await api.get(`/teams/${id}/stats`);
    return data;
  },
  getMembers: async (id, params = {}) => {
    const { data } = await api.get(`/teams/${id}/members`, { params });
    return data;
  },
};
