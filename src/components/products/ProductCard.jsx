import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import StarRating from '../common/StarRating'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import useAuthStore from '../../store/authStore'

export default function ProductCard({ product }) {
  const { addItem, isAdding } = useCart()
  const { isInWishlist, toggle } = useWishlist()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const discount = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const displayPrice = product.discountPrice || product.price

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    addItem({ productId: product._id, quantity: 1 })
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    toggle(product._id)
  }

  const inWishlist = isInWishlist(product._id)
  const outOfStock = product.stock === 0

  return (
    <Link
      to={`/products/${product._id}`}
      className="product-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        textDecoration: 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        border: '1px solid var(--gray-100)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      }}
    >
      {/* ── Image ─────────────────────────────────────── */}
      <div style={{ position: 'relative', paddingBottom: '72%', background: 'var(--gray-50)' }}>
        <img
          src={product.images?.[0]?.url || 'https://placehold.co/400x300?text=No+Image'}
          alt={product.title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />

        {/* Out of stock overlay */}
        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: 'var(--gray-700)', color: 'white',
              padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
            }}>
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && !outOfStock && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: 'var(--danger)', color: 'white',
            padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.7rem', fontWeight: 800, lineHeight: 1.4,
          }}>
            -{discount}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'white', border: 'none', borderRadius: '50%',
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            color: inWishlist ? 'var(--danger)' : 'var(--gray-400)',
            transition: 'transform 0.15s, color 0.15s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Info ──────────────────────────────────────── */}
      <div style={{
        padding: '0.875rem 0.875rem 1rem',
        flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem',
      }}>
        {/* Brand */}
        {product.brand && (
          <div style={{
            fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {product.brand}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)',
          lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: '2.5em',
        }}>
          {product.title}
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
          <StarRating rating={Math.round(product.averageRating || 0)} size={12} />
          <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--gray-900)' }}>
            ₹{displayPrice.toLocaleString('en-IN')}
          </span>
          {discount > 0 && (
            <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
          {discount > 0 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, marginLeft: 'auto' }}>
              Save ₹{(product.price - displayPrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Add to cart */}
        {!outOfStock && (
          <button
            className="btn btn-primary btn-sm btn-full"
            onClick={handleAddToCart}
            disabled={isAdding}
            style={{ marginTop: '0.625rem', justifyContent: 'center', gap: '0.375rem' }}
          >
            <ShoppingCart size={14} />
            {isAdding ? 'Adding…' : 'Add to Cart'}
          </button>
        )}
      </div>
    </Link>
  )
}
