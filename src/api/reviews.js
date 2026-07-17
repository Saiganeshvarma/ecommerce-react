import api from './axios'

export const reviewsAPI = {
  getReviews: (productId) => api.get(`/products/${productId}/reviews`),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  deleteReview: (productId, reviewId) => api.delete(`/products/${productId}/reviews/${reviewId}`),
}
