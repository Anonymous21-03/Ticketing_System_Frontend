import api from './api';

export const userApi = {
  getUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data;
  },
  getUser: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  updateUser: async (id, updates) => {
    const { data } = await api.patch(`/users/${id}`, updates);
    return data;
  },
  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
  reactivateUser: async (id) => {
    const { data } = await api.patch(`/users/${id}/reactivate`);
    return data;
  },
  changePassword: async (id, passwords) => {
    const { data } = await api.patch(`/users/${id}/password`, passwords);
    return data;
  },
  resetPassword: async (id, newPassword) => {
    const { data } = await api.patch(`/users/${id}/reset-password`, { new_password: newPassword });
    return data;
  },
};
