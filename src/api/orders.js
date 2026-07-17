import api from './axios'

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
  getOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
}
