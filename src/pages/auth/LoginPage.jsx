import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { authAPI } from '../../api/auth'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const from = location.state?.from?.pathname || '/'

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      const { token, user } = res.data.data
      setAuth(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach server. Make sure your backend is running.')
      } else {
        toast.error(err.response?.data?.message || `Error ${err.response.status}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--gray-50)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>Welcome back</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.375rem', fontSize: '0.9rem' }}>Sign in to your ShopZone account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }}
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

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : <LogIn size={18} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  )
}
