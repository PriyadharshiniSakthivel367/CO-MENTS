import axios from 'axios';

const origin = import.meta.env.VITE_API_URL || '';
const api = axios.create({
  baseURL: origin ? `${origin.replace(/\/$/, '')}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
};

export const commentsApi = {
  list: (params) => api.get('/comments', { params }),
  create: (text) => api.post('/comments', { text }),
  reply: (id, text) => api.post(`/comments/${id}/reply`, { text }),
  update: (id, text) => api.put(`/comments/${id}`, { text }),
  remove: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`),
  dislike: (id) => api.post(`/comments/${id}/dislike`),
};

export default api;
