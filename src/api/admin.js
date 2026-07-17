import api from './axios'

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Users
  getUsers: (search) => api.get('/admin/users', { params: { search } }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, orderStatus) => api.put(`/admin/orders/${id}/status`, { orderStatus }),
}
