import api from './axios'

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (productId) => api.post(`/wishlist/${productId}`),
  removeItem: (productId) => api.delete(`/wishlist/${productId}`),
}
