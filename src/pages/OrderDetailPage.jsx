import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, MapPin, CreditCard, XCircle, ChevronRight } from 'lucide-react'
import { ordersAPI } from '../api/orders'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'delivered']

const STATUS_COLORS = {
  processing: 'badge-warning',
  confirmed: 'badge-primary',
  shipped: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await ordersAPI.getById(id)
      return res.data.data.order
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => ordersAPI.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order cancelled')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot cancel order'),
  })

  if (isLoading) return <Spinner center />
  if (!order) return <div className="container" style={{ padding: '2rem' }}><p>Order not found.</p></div>

  const isCancellable = ['processing', 'confirmed'].includes(order.orderStatus)
  const currentStep = STATUS_STEPS.indexOf(order.orderStatus)
  const isCancelled = order.orderStatus === 'cancelled'

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: 800 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
        <Link to="/orders" style={{ color: 'var(--primary)' }}>My Orders</Link>
        <ChevronRight size={14} />
        <span>#{order._id.slice(-8).toUpperCase()}</span>
      </div>

      {/* Header */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
              {order.orderStatus?.toUpperCase()}
            </span>
            {isCancellable && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                <XCircle size={14} />
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {/* Line */}
              <div style={{
                position: 'absolute', top: 14, left: '12.5%', right: '12.5%',
                height: 3, background: 'var(--gray-200)', zIndex: 0,
              }}>
                <div style={{
                  height: '100%',
                  background: 'var(--primary)',
                  width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%',
                  transition: 'width 0.4s',
                }} />
              </div>

              {STATUS_STEPS.map((step, i) => (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i <= currentStep ? 'var(--primary)' : 'var(--gray-200)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.7rem', fontWeight: 700,
                    transition: 'background 0.3s',
                  }}>
                    {i <= currentStep ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: i <= currentStep ? 600 : 400,
                    color: i <= currentStep ? 'var(--primary)' : 'var(--gray-400)',
                    textTransform: 'capitalize', textAlign: 'center',
                  }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Delivery Address */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <MapPin size={16} color="var(--primary)" /> Delivery Address
          </h3>
          {order.address ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{order.address.fullName}</div>
              <div>{order.address.mobile}</div>
              <div>{order.address.houseNo}, {order.address.street}</div>
              <div>{order.address.city}, {order.address.state} — {order.address.pincode}</div>
            </div>
          ) : <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>Address not available</p>}
        </div>

        {/* Payment Info */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <CreditCard size={16} color="var(--primary)" /> Payment
          </h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Method:</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{order.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Status:</span>
              <span style={{
                fontWeight: 600,
                color: order.paymentStatus === 'paid' ? 'var(--success)' : order.paymentStatus === 'failed' ? 'var(--danger)' : 'var(--warning)',
                textTransform: 'capitalize',
              }}>{order.paymentStatus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--gray-900)' }}>
              <span>Total:</span>
              <span>₹{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={16} color="var(--primary)" /> Items ({order.items?.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.875rem', borderBottom: i < order.items.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
              <img
                src={item.product?.images?.[0]?.url || 'https://placehold.co/64x64?text=?'}
                alt={item.product?.title || item.title}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product?.title || item.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span style={{ color: 'var(--gray-500)' }}>Subtotal</span>
              <span>₹{(order.totalAmount - (order.deliveryFee || 0)).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span style={{ color: 'var(--gray-500)' }}>Delivery</span>
              <span style={{ color: (order.deliveryFee || 0) === 0 ? 'var(--success)' : undefined }}>
                {(order.deliveryFee || 0) === 0 ? 'FREE' : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2rem', fontWeight: 700, fontSize: '1.05rem', marginTop: '0.25rem' }}>
              <span>Total</span>
              <span>₹{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
