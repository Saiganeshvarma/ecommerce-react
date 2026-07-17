import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { authAPI } from '../../api/auth'
import toast from 'react-hot-toast'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!passwordRegex.test(password)) {
      setError('Min 8 chars with uppercase, lowercase, number & special char')
      return
    }
    setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      toast.success('Password reset! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed or link expired')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Reset Password</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter your new password below.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="New password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                style={{ paddingRight: '2.5rem', width: '100%' }}
              />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', background: 'none', border: 'none' }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <span className="form-error">{error}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : <Lock size={18} />}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
