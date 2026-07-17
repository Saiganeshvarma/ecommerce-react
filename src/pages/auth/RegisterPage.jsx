import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { authAPI } from '../../api/auth'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.phone) errs.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Must be 10 digits'
    if (!form.password) errs.password = 'Password is required'
    else if (!passwordRegex.test(form.password)) errs.password = 'Min 8 chars with uppercase, lowercase, number & special char'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await authAPI.register(form)
      const { token, user } = res.data.data
      setAuth(user, token)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach server. Make sure your backend is running on ' + (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'))
      } else {
        const msg = err.response?.data?.message || `Error ${err.response.status}`
        toast.error(msg)
        if (err.response?.status === 409) setErrors({ email: 'Email already registered' })
      }
    } finally {
      setLoading(false)
    }
  }

  const f = (field) => ({
    value: form[field],
    onChange: (e) => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }) },
    className: `form-input ${errors[field] ? 'error' : ''}`,
  })

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--gray-50)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>Create an account</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.375rem', fontSize: '0.9rem' }}>Start shopping on ShopZone today</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {[
            { label: 'Full Name', field: 'name', type: 'text', placeholder: 'John Doe' },
            { label: 'Email', field: 'email', type: 'email', placeholder: 'john@example.com' },
            { label: 'Phone', field: 'phone', type: 'tel', placeholder: '9876543210' },
          ].map(({ label, field, type, placeholder }) => (
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <input type={type} placeholder={placeholder} {...f(field)} />
              {errors[field] && <span className="form-error">{errors[field]}</span>}
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, uppercase, number, special char"
                {...f('password')}
                style={{ paddingRight: '2.5rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', background: 'none', border: 'none' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <span className="spinner spinner-sm" /> : <UserPlus size={18} />}
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
