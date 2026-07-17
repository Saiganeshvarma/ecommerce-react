import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../api/admin'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled']

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

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter, paymentFilter],
    queryFn: async () => {
      const params = { page, limit: 15, ...(statusFilter && { status: statusFilter }), ...(paymentFilter && { paymentStatus: paymentFilter }) }
      const res = await adminAPI.getOrders(params)
      return res.data.data
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, orderStatus }) => adminAPI.updateOrderStatus(id, orderStatus),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status updated') },
    onError: () => toast.error('Failed to update status'),
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Orders</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1) }}>
            <option value="">All Payments</option>
            {['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? <Spinner center /> : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-100)' }}>
                    {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Update Status'].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.orders?.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--gray-100)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 500 }}>{order.user?.name || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{order.user?.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{order.items?.length || 0}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{order.totalAmount?.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${PAYMENT_COLORS[order.paymentStatus] || 'badge-gray'}`}>{order.paymentStatus}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-gray'}`}>{order.orderStatus}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
                          value={order.orderStatus}
                          disabled={statusMutation.isPending}
                          onChange={(e) => statusMutation.mutate({ id: order._id, orderStatus: e.target.value })}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}
