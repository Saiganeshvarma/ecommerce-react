import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, Heart, Star, Truck, Shield, ChevronRight, Trash2 } from 'lucide-react'
import { productsAPI } from '../api/products'
import { reviewsAPI } from '../api/reviews'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import useAuthStore from '../store/authStore'
import StarRating from '../components/common/StarRating'
import ProductCard from '../components/products/ProductCard'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { addItem, isAdding } = useCart()
  const { isInWishlist, toggle } = useWishlist()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await productsAPI.getById(id)
      return res.data.data.product
    },
  })

  const { data: related } = useQuery({
    queryKey: ['related', id],
    queryFn: async () => {
      const res = await productsAPI.getRelated(id)
      return res.data.data.products
    },
    enabled: !!id,
  })

  const reviewMutation = useMutation({
    mutationFn: (data) => reviewsAPI.addReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      setReviewForm({ rating: 5, comment: '' })
      setShowReviewForm(false)
      toast.success('Review submitted!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit review'),
  })

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => reviewsAPI.deleteReview(id, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Review deleted')
    },
  })

  if (isLoading) return <Spinner center />

  if (!product) return (
    <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Products</Link>
    </div>
  )

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    addItem({ productId: product._id, quantity })
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return }
    reviewMutation.mutate(reviewForm)
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--primary)' }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" style={{ color: 'var(--primary)' }}>Products</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--gray-700)', fontWeight: 500 }}>{product.title}</span>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2.5rem', marginBottom: '3rem' }}>
        {/* Images */}
        <div>
          <div style={{
            background: 'var(--gray-100)', borderRadius: 'var(--radius-lg)',
            overflow: 'hidden', aspectRatio: '4/3', marginBottom: '0.75rem',
          }}>
            <img
              src={product.images?.[selectedImage]?.url || 'https://placehold.co/600x450?text=No+Image'}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: 64, height: 64, border: `2px solid ${i === selectedImage ? 'var(--primary)' : 'var(--gray-200)'}`,
                    borderRadius: 'var(--radius)', overflow: 'hidden', padding: 0, background: 'var(--gray-50)',
                  }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '0.25rem' }}>{product.brand}</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.75rem' }}>{product.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <StarRating rating={Math.round(product.averageRating || 0)} size={18} />
            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              {product.averageRating?.toFixed(1)} ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gray-900)' }}>
              ₹{(product.discountPrice || product.price).toLocaleString()}
            </span>
            {discount > 0 && (
              <>
                <span style={{ fontSize: '1.1rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="badge badge-success">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div style={{ marginBottom: '1.25rem' }}>
            {product.stock > 0 ? (
              <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>✗ Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ borderRadius: 0, padding: '0.375rem 0.75rem' }}
                >−</button>
                <span style={{ padding: '0 1rem', fontWeight: 600 }}>{quantity}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ borderRadius: 0, padding: '0.375rem 0.75rem' }}
                >+</button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              style={{ flex: 1 }}
            >
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => { if (!isAuthenticated) { navigate('/login'); return } toggle(product._id) }}
              style={{ color: isInWishlist(product._id) ? 'var(--danger)' : undefined, borderColor: isInWishlist(product._id) ? 'var(--danger)' : undefined }}
            >
              <Heart size={18} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--gray-600)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Truck size={15} /> Free Delivery</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Shield size={15} /> Secure Payment</div>
          </div>

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Specifications</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'var(--gray-50)' : 'white' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--gray-700)', width: '40%' }}>{spec.key}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--gray-600)' }}>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Product Description</h2>
        <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 700 }}>Reviews ({product.reviews?.length || 0})</h2>
          {isAuthenticated && (
            <button className="btn btn-outline btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Cancel' : '+ Write Review'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
            <div className="form-group">
              <label className="form-label">Your Rating</label>
              <StarRating rating={reviewForm.rating} size={24} interactive onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? <span className="spinner spinner-sm" /> : null}
              Submit Review
            </button>
          </form>
        )}

        {/* Review List */}
        {product.reviews?.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {product.reviews?.map((review) => (
              <div key={review._id} style={{ padding: '1rem', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.user?.name || 'Anonymous'}</div>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {(user?._id === review.user?._id || user?.role === 'admin') && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)', padding: '0.25rem' }}
                        onClick={() => deleteReviewMutation.mutate(review._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related?.length > 0 && (
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Related Products</h2>
          <div className="grid grid-4">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
