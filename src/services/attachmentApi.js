import api from './api';

export const attachmentApi = {
  presignUpload: async (ticketId, fileData) => {
    // fileData = { filename: string, content_type: string }
    const { data } = await api.post(`/tickets/${ticketId}/attachments/presign`, fileData);
    return data;
  },
  confirmUpload: async (ticketId, attachmentId) => {
    const { data } = await api.post(`/tickets/${ticketId}/attachments/${attachmentId}/confirm`);
    return data;
  },
  getAttachments: async (ticketId) => {
    const { data } = await api.get(`/tickets/${ticketId}/attachments`);
    return data;
  },
  getDownloadUrl: async (ticketId, attachmentId) => {
    const { data } = await api.get(`/tickets/${ticketId}/attachments/${attachmentId}/download`);
    return data;
  },
  deleteAttachment: async (ticketId, attachmentId) => {
    const { data } = await api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
    return data;
  },
};
