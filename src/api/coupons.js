import api from './axios'

export const couponsAPI = {
  // User
  apply: (couponCode) => api.post('/coupons/apply', { couponCode }),

  // Admin
  getAll: (params) => api.get('/admin/coupons', { params }),
  getById: (id) => api.get(`/admin/coupons/${id}`),
  create: (data) => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  delete: (id) => api.delete(`/admin/coupons/${id}`),
  toggleStatus: (id, active) => api.patch(`/admin/coupons/${id}/status`, { active }),
}
