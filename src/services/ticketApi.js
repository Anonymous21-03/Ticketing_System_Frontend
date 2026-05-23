import api from './api';

export const ticketApi = {
  getTickets: async (params = {}) => {
    const { data } = await api.get('/tickets', { params });
    return data;
  },
  getTicket: async (id) => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },
  createTicket: async (ticket) => {
    const { data } = await api.post('/tickets', ticket);
    return data;
  },
  updateTicket: async (id, updates) => {
    const { data } = await api.patch(`/tickets/${id}`, updates);
    return data;
  },
  deleteTicket: async (id) => {
    const { data } = await api.delete(`/tickets/${id}`);
    return data;
  },
  reactivateTicket: async (id) => {
    const { data } = await api.patch(`/tickets/${id}/reactivate`);
    return data;
  },
  getCreatedByMe: async (params = {}) => {
    const { data } = await api.get('/tickets/created-by-me', { params });
    return data;
  },
  getAssignedToMe: async (params = {}) => {
    const { data } = await api.get('/tickets/assigned-to-me', { params });
    return data;
  },
  getTeamTickets: async (teamId, params = {}) => {
    const { data } = await api.get(`/tickets/team/${teamId}`, { params });
    return data;
  },
  getUserAssigned: async (userId, params = {}) => {
    const { data } = await api.get(`/tickets/user/${userId}/assigned`, { params });
    return data;
  },
  getStats: async (teamId) => {
    const params = teamId ? { team_id: teamId } : {};
    const { data } = await api.get('/tickets/stats', { params });
    return data;
  },
  getHistory: async (id, params = {}) => {
    const { data } = await api.get(`/tickets/${id}/history`, { params });
    return data;
  },
};
