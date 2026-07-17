import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import { couponsAPI } from '../../api/coupons'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const BLANK = {
  code: '', title: '', description: '',
  discountType: 'percentage', discountValue: '',
  minimumOrderAmount: '0', maximumDiscount: '',
  startDate: '', expiryDate: '',
  usageLimit: '0', active: true,
}

const formatDiscount = (coupon) => {
  if (coupon.discountType === 'percentage') {
    const cap = coupon.maximumDiscount ? ` (up to ₹${coupon.maximumDiscount})` : ''
    return `${coupon.discountValue}% off${cap}`
  }
  return `₹${coupon.discountValue} flat off`
}

const formatUsage = (coupon) => {
  const limit = coupon.usageLimit === 0 ? '∞' : coupon.usageLimit
  return `${coupon.usedCount} / ${limit}`
}

const getCouponStatus = (coupon) => {
  const now = new Date()
  if (!coupon.active) return { label: 'Disabled', color: 'var(--gray-400)', bg: 'var(--gray-100)' }
  if (now < new Date(coupon.startDate)) return { label: 'Upcoming', color: '#2563eb', bg: '#dbeafe' }
  if (now > new Date(coupon.expiryDate)) return { label: 'Expired', color: 'var(--danger)', bg: '#fee2e2' }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { label: 'Limit Reached', color: '#d97706', bg: '#fef3c7' }
  }
  return { label: 'Live', color: 'var(--success)', bg: '#dcfce7' }
}

const toInputDate = (iso) => (iso ? iso.slice(0, 16) : '')

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCoupon, setEditCoupon] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons', page, search, filterStatus, filterType],
    queryFn: async () => {
      const params = {
        page, limit: 10,
        ...(search && { search }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterType && { discountType: filterType }),
      }
      const res = await couponsAPI.getAll(params)
      return res.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => couponsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon deleted')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => couponsAPI.toggleStatus(id, active),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      const label = res.data.data.coupon.active ? 'enabled' : 'disabled'
      toast.success(`Coupon ${label}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to toggle'),
  })

  const openAdd = () => {
    setForm(BLANK)
    setEditCoupon(null)
    setValidationErrors({})
    setShowModal(true)
  }

  const openEdit = (c) => {
    setForm({
      code: c.code,
      title: c.title,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minimumOrderAmount: String(c.minimumOrderAmount),
      maximumDiscount: c.maximumDiscount != null ? String(c.maximumDiscount) : '',
      startDate: toInputDate(c.startDate),
      expiryDate: toInputDate(c.expiryDate),
      usageLimit: String(c.usageLimit),
      active: c.active,
    })
    setEditCoupon(c)
    setValidationErrors({})
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setValidationErrors({})
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        title: form.title.trim(),
        ...(form.description && { description: form.description.trim() }),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount) || 0,
        ...(form.maximumDiscount !== '' && { maximumDiscount: Number(form.maximumDiscount) }),
        startDate: new Date(form.startDate).toISOString(),
        expiryDate: new Date(form.expiryDate).toISOString(),
        usageLimit: Number(form.usageLimit) || 0,
        active: form.active,
      }
      if (editCoupon) {
        await couponsAPI.update(editCoupon._id, payload)
        toast.success('Coupon updated')
      } else {
        await couponsAPI.create(payload)
        toast.success('Coupon created')
      }
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      setShowModal(false)
    } catch (err) {
      const errData = err.response?.data
      if (errData?.errors?.length) {
        const map = {}
        errData.errors.forEach(({ field, message }) => { map[field] = message })
        setValidationErrors(map)
        toast.error('Please fix the errors below')
      } else {
        toast.error(errData?.message || 'Failed to save coupon')
      }
    } finally {
      setSaving(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Coupons</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              className="form-input"
              placeholder="Search code or title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              style={{ paddingLeft: 32, width: 200 }}
            />
          </div>
          <select className="form-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }} style={{ width: 130 }}>
            <option value="">All Status</option>
            <option value="live">Live</option>
            <option value="upcoming">Upcoming</option>
            <option value="expired">Expired</option>
          </select>
          <select className="form-select" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }} style={{ width: 140 }}>
            <option value="">All Types</option>
            <option value="percentage">% Percentage</option>
            <option value="fixed">₹ Fixed</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Add Coupon</button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? <Spinner center /> : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-100)' }}>
                    {['Code', 'Title', 'Discount', 'Min Order', 'Usage', 'Valid Until', 'Status', ''].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.coupons?.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>No coupons found</td>
                    </tr>
                  )}
                  {data?.coupons?.map((c) => {
                    const status = getCouponStatus(c)
                    return (
                      <tr key={c._id} style={{ borderBottom: '1px solid var(--gray-100)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, background: 'var(--gray-100)', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.8rem' }}>
                            {c.code}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', maxWidth: 180 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{c.title}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            background: c.discountType === 'percentage' ? '#dbeafe' : '#dcfce7',
                            color: c.discountType === 'percentage' ? '#2563eb' : 'var(--success)',
                            padding: '0.2rem 0.5rem', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
                          }}>
                            {formatDiscount(c)}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)' }}>
                          {c.minimumOrderAmount > 0 ? `₹${c.minimumOrderAmount}` : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)' }}>{formatUsage(c)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>
                          {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: status.bg, color: status.color, padding: '0.2rem 0.625rem', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600 }}>
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: c.active ? 'var(--success)' : 'var(--gray-400)' }}
                              title={c.active ? 'Disable coupon' : 'Enable coupon'}
                              onClick={() => toggleMutation.mutate({ id: c._id, active: !c.active })}
                            >
                              {c.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => openEdit(c)}>
                              <Pencil size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                              onClick={() => { if (confirm(`Delete coupon "${c.code}"?`)) deleteMutation.mutate(c._id) }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 640, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 700 }}>{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid grid-2">
                {/* Code */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Coupon Code *</label>
                  <input className="form-input" required placeholder="e.g. SAVE20" maxLength={20}
                    {...field('code')} style={{ textTransform: 'uppercase' }} />
                  {validationErrors.code && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{validationErrors.code}</p>}
                </div>

                {/* Title */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" required placeholder="e.g. Save 20% on your order" maxLength={100} {...field('title')} />
                  {validationErrors.title && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{validationErrors.title}</p>}
                </div>

                {/* Discount Type */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Type *</label>
                  <select className="form-select" style={{ width: '100%' }} required {...field('discountType')}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Discount Value * {form.discountType === 'percentage' ? '(1–100%)' : '(₹ amount)'}
                  </label>
                  <input className="form-input" type="number" required min={0}
                    max={form.discountType === 'percentage' ? 100 : undefined}
                    placeholder={form.discountType === 'percentage' ? '20' : '100'}
                    {...field('discountValue')} />
                  {validationErrors.discountValue && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{validationErrors.discountValue}</p>}
                </div>

                {/* Min Order */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Minimum Order Amount (₹)</label>
                  <input className="form-input" type="number" min={0} placeholder="0 = no minimum" {...field('minimumOrderAmount')} />
                  {validationErrors.minimumOrderAmount && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{validationErrors.minimumOrderAmount}</p>}
                </div>

                {/* Max Discount — only for percentage */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Discount Cap (₹) {form.discountType !== 'percentage' && <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>(percentage only)</span>}</label>
                  <input className="form-input" type="number" min={0}
                    placeholder={form.discountType === 'percentage' ? 'e.g. 200 — leave blank for no cap' : 'N/A for fixed'}
                    disabled={form.discountType === 'fixed'}
                    {...field('maximumDiscount')}
                    style={form.discountType === 'fixed' ? { background: 'var(--gray-50)', color: 'var(--gray-400)' } : {}}
                  />
                </div>

                {/* Start Date */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Date *</label>
                  <input className="form-input" type="datetime-local" required {...field('startDate')} />
                  {validationErrors.startDate && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{validationErrors.startDate}</p>}
                </div>

                {/* Expiry Date */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Expiry Date *</label>
                  <input className="form-input" type="datetime-local" required {...field('expiryDate')} />
                  {validationErrors.expiryDate && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: 4 }}>{validationErrors.expiryDate}</p>}
                </div>

                {/* Usage Limit */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Usage Limit</label>
                  <input className="form-input" type="number" min={0} placeholder="0 = unlimited" {...field('usageLimit')} />
                </div>

                {/* Active */}
                <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.625rem', paddingTop: '1.5rem' }}>
                  <input
                    type="checkbox"
                    id="coupon-active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="coupon-active" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Active (visible to users)</label>
                </div>
              </div>

              {/* Description */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} maxLength={300}
                  placeholder="Short description shown to users (optional)"
                  {...field('description')} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner spinner-sm" /> : null}
                  {saving ? 'Saving...' : editCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
