import { useQuery } from '@tanstack/react-query'
import { Users, ShoppingBag, DollarSign, TrendingUp, Package } from 'lucide-react'
import { adminAPI } from '../../api/admin'
import Spinner from '../../components/common/Spinner'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  processing: 'badge-warning',
  confirmed: 'badge-primary',
  shipped: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await adminAPI.getDashboard()
      return res.data.data
    },
    staleTime: 60000,
  })

  if (isLoading) return <Spinner center />

  const { stats, monthlyRevenue, topProducts, latestOrders } = data || {}

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || 0, icon: Users, color: '#2563eb', bg: '#dbeafe' },
    { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString() || 0, icon: ShoppingBag, color: '#16a34a', bg: '#dcfce7' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: '#ca8a04', bg: '#fef3c7' },
    { label: 'Avg. Order Value', value: stats?.totalOrders ? `₹${Math.round((stats.totalRevenue || 0) / stats.totalOrders).toLocaleString()}` : '₹0', icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe' },
  ]

  return (
    <div>
      <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' }}>Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: bg, borderRadius: 'var(--radius)', padding: '0.875rem', flexShrink: 0 }}>
              <Icon size={24} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Monthly Revenue */}
        {monthlyRevenue?.length > 0 && (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Monthly Revenue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {monthlyRevenue.slice(-6).map((m, i) => {
                const max = Math.max(...monthlyRevenue.slice(-6).map((x) => x.revenue || 0))
                const pct = max > 0 ? ((m.revenue || 0) / max) * 100 : 0
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <span style={{ width: 60, flexShrink: 0, color: 'var(--gray-500)' }}>
                      {m.month || `Month ${i + 1}`}
                    </span>
                    <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 99, width: `${pct}%`, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ width: 80, textAlign: 'right', fontWeight: 600 }}>₹{(m.revenue || 0).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top Products */}
        {topProducts?.length > 0 && (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Top Products</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topProducts.slice(0, 5).map((p, i) => (
                <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <span style={{ width: 20, height: 20, background: 'var(--primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>{i + 1}</span>
                  <img src={p.images?.[0]?.url || 'https://placehold.co/36x36?text=?'} alt=""
                    style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>{p.totalSold || 0} sold</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{(p.discountPrice || p.price || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Latest Orders */}
      {latestOrders?.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>View all</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-100)' }}>
                  {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>{order.user?.name || '—'}</td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>{order.items?.length || 0}</td>
                    <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>₹{order.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus}</span>
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--gray-500)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
