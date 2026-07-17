import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useCart } from '../hooks/useCart'
import { couponsAPI } from '../api/coupons'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  const applyMutation = useMutation({
    mutationFn: (code) => couponsAPI.apply(code),
    onSuccess: (res) => {
      setAppliedCoupon(res.data.data)
      setCouponError('')
      setCouponInput('')
      toast.success(`Coupon "${res.data.data.coupon}" applied!`)
    },
    onError: (err) => {
      setCouponError(err.response?.data?.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    },
  })

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return
    setCouponError('')
    applyMutation.mutate(couponInput.trim())
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
    toast.success('Coupon removed')
  }

  if (isLoading) return <Spinner center />

  const items = cart?.products || []
  const subtotal = items.reduce((acc, item) => acc + (item.product?.discountPrice || item.product?.price || 0) * item.quantity, 0)
  const savings = items.reduce((acc, item) => {
    const diff = (item.product?.price || 0) - (item.product?.discountPrice || item.product?.price || 0)
    return acc + diff * item.quantity
  }, 0)

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="page-title">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add products to your cart and they'll appear here."
            action={<Link to="/products" className="btn btn-primary">Start Shopping</Link>}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{items.length} item(s)</span>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => clearCart()}>
                Clear All
              </button>
            </div>

            {items.map((item) => {
              const product = item.product
              if (!product) return null
              const price = product.discountPrice || product.price
              return (
                <div key={item._id || product._id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images?.[0]?.url || 'https://placehold.co/80x80?text=?'}
                      alt={product.title}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius)', flexShrink: 0 }}
                    />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/products/${product._id}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                      {product.title}
                    </Link>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>{product.brand}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ borderRadius: 0, padding: '0.25rem 0.625rem' }}
                          onClick={() => updateItem({ productId: product._id, quantity: Math.max(1, item.quantity - 1) })}
                        ><Minus size={14} /></button>
                        <span style={{ padding: '0 0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>{item.quantity}</span>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ borderRadius: 0, padding: '0.25rem 0.625rem' }}
                          onClick={() => updateItem({ productId: product._id, quantity: item.quantity + 1 })}
                        ><Plus size={14} /></button>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                        ₹{(price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--gray-400)', padding: '0.25rem', flexShrink: 0 }}
                    onClick={() => removeItem(product._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Order Summary</h2>

            {/* Coupon Input */}
            {!appliedCoupon ? (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                      className="form-input"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      style={{ paddingLeft: 30, textTransform: 'uppercase', fontSize: '0.875rem' }}
                    />
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleApplyCoupon}
                    disabled={applyMutation.isPending || !couponInput.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {applyMutation.isPending ? <span className="spinner spinner-sm" /> : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.375rem' }}>{couponError}</p>
                )}
              </div>
            ) : (
              <div style={{ background: '#dcfce7', borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Tag size={13} /> {appliedCoupon.coupon}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.1rem' }}>
                    {appliedCoupon.couponTitle}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--gray-400)', padding: '0.2rem' }} onClick={handleRemoveCoupon}>
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Price Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-600)' }}>Subtotal ({items.length} items)</span>
                <span>₹{(appliedCoupon ? appliedCoupon.subtotal : subtotal).toLocaleString()}</span>
              </div>
              {savings > 0 && !appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Savings</span>
                  <span>-₹{savings.toLocaleString()}</span>
                </div>
              )}
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>
                    Coupon ({appliedCoupon.discountType === 'percentage'
                      ? `${appliedCoupon.discountValue}%`
                      : `₹${appliedCoupon.discountValue}`})
                  </span>
                  <span>-₹{appliedCoupon.discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)' }}>
                <span>Delivery</span>
                {appliedCoupon ? (
                  <span style={{ color: appliedCoupon.shipping === 0 ? 'var(--success)' : undefined }}>
                    {appliedCoupon.shipping === 0 ? 'FREE' : `₹${appliedCoupon.shipping}`}
                  </span>
                ) : (
                  <span style={{ color: 'var(--success)' }}>{subtotal >= 499 ? 'FREE' : '₹49'}</span>
                )}
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)' }}>
                  <span>Tax (18% GST)</span>
                  <span>₹{appliedCoupon.tax.toLocaleString()}</span>
                </div>
              )}
              <hr className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span>
                  {appliedCoupon
                    ? `₹${appliedCoupon.grandTotal.toLocaleString()}`
                    : `₹${(subtotal + (subtotal >= 499 ? 0 : 49)).toLocaleString()}`}
                </span>
              </div>
            </div>

            {(savings > 0 || appliedCoupon) && (
              <div style={{ background: '#dcfce7', borderRadius: 'var(--radius)', padding: '0.625rem 0.875rem', fontSize: '0.82rem', color: 'var(--success)', marginBottom: '1rem', fontWeight: 600 }}>
                🎉 You're saving ₹{(savings + (appliedCoupon?.discount || 0)).toLocaleString()} on this order!
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => navigate('/checkout', { state: { appliedCoupon } })}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--primary)' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
