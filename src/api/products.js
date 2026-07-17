import api from './axios'

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getById: (id) => api.get(`/products/${id}`),
  getRelated: (id) => api.get(`/products/${id}/related`),

  // Admin
  create: (formData) =>
    api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
}
