import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight } from 'lucide-react'
import { ordersAPI } from '../api/orders'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'

const STATUS_COLORS = {
  processing: 'badge-warning',
  confirmed: 'badge-primary',
  shipped: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
}

const PAYMENT_COLORS = {
  pending: 'badge-warning',
  paid: 'badge-success',
  failed: 'badge-danger',
  refunded: 'badge-gray',
}

export default function OrdersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: async () => {
      const res = await ordersAPI.getOrders({ page, limit: 10 })
      return res.data.data
    },
    staleTime: 30000,
  })

  if (isLoading) return <Spinner center />

  const orders = data?.orders || []

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Your orders will appear here once you place one."
            action={<Link to="/products" className="btn btn-primary">Shop Now</Link>}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="card"
                style={{ padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-800)', marginBottom: '0.25rem' }}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`badge ${PAYMENT_COLORS[order.paymentStatus] || 'badge-gray'}`}>
                      {order.paymentStatus}
                    </span>
                    <ChevronRight size={16} color="var(--gray-400)" />
                  </div>
                </div>

                <hr className="divider" style={{ margin: '0.875rem 0' }} />

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {order.items?.slice(0, 4).map((item, i) => (
                    <img
                      key={i}
                      src={item.product?.images?.[0]?.url || 'https://placehold.co/48x48?text=?'}
                      alt={item.product?.title}
                      style={{ width: 48, height: 48, borderRadius: 'var(--radius)', objectFit: 'cover', border: '1px solid var(--gray-100)' }}
                    />
                  ))}
                  {order.items?.length > 4 && (
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--radius)',
                      background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-600)',
                    }}>
                      +{order.items.length - 4}
                    </div>
                  )}
                  <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '1rem' }}>
                    ₹{order.totalAmount?.toLocaleString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <div style={{ marginTop: '1rem' }}>
            <Pagination
              page={page}
              totalPages={data?.pagination?.totalPages || 1}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
