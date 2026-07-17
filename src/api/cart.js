import api from './axios'

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity) => api.post('/cart', { productId, quantity }),
  updateItem: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
}
