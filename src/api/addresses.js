import api from './axios'

export const addressesAPI = {
  getAll: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
  delete: (id) => api.delete(`/addresses/${id}`),
}
