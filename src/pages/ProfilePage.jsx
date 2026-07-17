import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, MapPin, Lock, Camera, Plus, Trash2, Star } from 'lucide-react'
import { authAPI } from '../api/auth'
import { addressesAPI } from '../api/addresses'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const queryClient = useQueryClient()

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'password', label: 'Password', icon: Lock },
  ]

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: 900 }}>
      <h1 className="page-title">My Account</h1>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div className="card" style={{ width: 200, flexShrink: 0, padding: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.5rem', margin: '0 auto 0.5rem',
              overflow: 'hidden',
            }}>
              {user?.profileImage?.url
                ? <img src={user.profileImage.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.name?.[0]?.toUpperCase()
              }
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{user?.email}</div>
            {user?.role === 'admin' && (
              <span className="badge badge-primary" style={{ marginTop: '0.375rem' }}>Admin</span>
            )}
          </div>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%',
                padding: '0.625rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem',
                fontWeight: activeTab === id ? 600 : 400,
                background: activeTab === id ? 'var(--primary-light)' : 'transparent',
                color: activeTab === id ? 'var(--primary)' : 'var(--gray-600)',
                border: 'none', cursor: 'pointer', marginBottom: '0.25rem',
                transition: 'background 0.1s',
              }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 'profile' && <ProfileTab user={user} updateUser={updateUser} />}
          {activeTab === 'addresses' && <AddressesTab />}
          {activeTab === 'password' && <PasswordTab />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user, updateUser }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('phone', form.phone)
      if (imageFile) fd.append('profileImage', imageFile)
      const res = await authAPI.updateProfile(fd)
      updateUser(res.data.data.user)
      toast.success('Profile updated!')
      setImageFile(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Profile Information</h2>
      <form onSubmit={handleSubmit}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '2rem',
            }}>
              {preview || user?.profileImage?.url
                ? <img src={preview || user.profileImage.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.name?.[0]?.toUpperCase()
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                background: 'var(--primary)', color: 'white', border: 'none',
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Camera size={13} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageChange} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Profile Photo</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>JPEG, PNG, WEBP · max 5MB</div>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={user?.email || ''} disabled style={{ background: 'var(--gray-50)', cursor: 'not-allowed' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Email cannot be changed</span>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner spinner-sm" /> : null}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

function AddressesTab() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ fullName: '', mobile: '', houseNo: '', street: '', city: '', state: '', country: 'India', pincode: '', isDefault: false })
  const [loading, setLoading] = useState(false)

  const { data: addresses, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await addressesAPI.getAll()
      return res.data.data.addresses
    },
  })

  const blank = { fullName: '', mobile: '', houseNo: '', street: '', city: '', state: '', country: 'India', pincode: '', isDefault: false }

  const openAdd = () => { setForm(blank); setEditingId(null); setShowForm(true) }
  const openEdit = (addr) => { setForm(addr); setEditingId(addr._id); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await addressesAPI.update(editingId, form)
        toast.success('Address updated')
      } else {
        await addressesAPI.create(form)
        toast.success('Address added')
      }
      await refetch()
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      await addressesAPI.delete(id)
      await refetch()
      toast.success('Address deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleSetDefault = async (id) => {
    try {
      await addressesAPI.setDefault(id)
      await refetch()
      toast.success('Default address updated')
    } catch { toast.error('Failed') }
  }

  const fields = [
    { field: 'fullName', label: 'Full Name', placeholder: 'John Doe', pattern: null },
    { field: 'mobile', label: 'Mobile', placeholder: '9876543210', pattern: '^[6-9][0-9]{9}$', title: 'Enter a valid 10-digit mobile number starting with 6-9', maxLength: 10, inputMode: 'numeric' },
    { field: 'houseNo', label: 'House/Flat No', placeholder: '12A', pattern: null },
    { field: 'street', label: 'Street', placeholder: 'MG Road', pattern: null },
    { field: 'city', label: 'City', placeholder: 'Bangalore', pattern: null },
    { field: 'state', label: 'State', placeholder: 'Karnataka', pattern: null },
    { field: 'pincode', label: 'Pincode', placeholder: '560001', pattern: '^[0-9]{6}$', title: 'Enter a valid 6-digit pincode', maxLength: 6, inputMode: 'numeric' },
  ]

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 700 }}>Saved Addresses</h2>
        <button className="btn btn-outline btn-sm" onClick={openAdd}>
          <Plus size={15} /> Add New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>{editingId ? 'Edit Address' : 'New Address'}</h3>
          <div className="grid grid-2">
            {fields.map(({ field, label, placeholder, pattern, title, maxLength, inputMode }) => (
              <div className="form-group" key={field} style={{ margin: 0 }}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  placeholder={placeholder}
                  value={form[field] || ''}
                  required
                  pattern={pattern || undefined}
                  title={title || undefined}
                  maxLength={maxLength || undefined}
                  inputMode={inputMode || undefined}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            <input type="checkbox" id="isDefault" checked={form.isDefault || false}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            <label htmlFor="isDefault" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Set as default</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : null}
              {editingId ? 'Update' : 'Save Address'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {addresses?.length === 0 && (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>
            No addresses saved yet.
          </p>
        )}
        {addresses?.map((addr) => (
          <div key={addr._id} style={{
            padding: '1rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)',
            position: 'relative',
          }}>
            {addr.isDefault && <span className="badge badge-primary" style={{ position: 'absolute', top: 10, right: 10 }}>Default</span>}
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{addr.fullName} · {addr.mobile}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginTop: '0.25rem', lineHeight: 1.6 }}>
              {addr.houseNo}, {addr.street}, {addr.city},<br />{addr.state}, {addr.country} — {addr.pincode}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(addr)}>Edit</button>
              {!addr.isDefault && (
                <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => handleSetDefault(addr._id)}>
                  <Star size={13} /> Set Default
                </button>
              )}
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginLeft: 'auto' }} onClick={() => handleDelete(addr._id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PasswordTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.currentPassword) errs.currentPassword = 'Required'
    if (!passwordRegex.test(form.newPassword)) errs.newPassword = 'Min 8 chars with uppercase, lowercase, number & special char'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await authAPI.changePassword(form)
      toast.success('Password changed successfully!')
      setForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Change Password</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input type="password" className={`form-input ${errors.currentPassword ? 'error' : ''}`}
            value={form.currentPassword}
            onChange={(e) => { setForm({ ...form, currentPassword: e.target.value }); setErrors({ ...errors, currentPassword: '' }) }} />
          {errors.currentPassword && <span className="form-error">{errors.currentPassword}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input type="password" className={`form-input ${errors.newPassword ? 'error' : ''}`}
            placeholder="Min 8 chars, uppercase, number, special char"
            value={form.newPassword}
            onChange={(e) => { setForm({ ...form, newPassword: e.target.value }); setErrors({ ...errors, newPassword: '' }) }} />
          {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner spinner-sm" /> : null}
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
