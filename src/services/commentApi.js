import api from './api';

export const commentApi = {
  getComments: async (ticketId, params = {}) => {
    const { data } = await api.get(`/tickets/${ticketId}/comments`, { params });
    return data;
  },
  createComment: async (ticketId, commentObj) => {
    const { data } = await api.post(`/tickets/${ticketId}/comments`, commentObj);
    return data;
  },
  getComment: async (commentId) => {
    const { data } = await api.get(`/comments/${commentId}`);
    return data;
  },
  updateComment: async (commentId, commentObj) => {
    const { data } = await api.patch(`/comments/${commentId}`, commentObj);
    return data;
  },
  deleteComment: async (commentId) => {
    const { data } = await api.delete(`/comments/${commentId}`);
    return data;
  },

};
