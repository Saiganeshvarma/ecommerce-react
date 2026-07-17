import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { authAPI } from '../../api/auth'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Enter your email'); return }
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset email sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Forgot password?</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Enter your email and we'll send a reset link. It expires in 15 minutes.
        </p>

        {sent ? (
          <div style={{ background: '#dcfce7', borderRadius: 'var(--radius)', padding: '1rem', color: 'var(--success)', textAlign: 'center' }}>
            <Mail size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600 }}>Check your email!</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>A reset link has been sent to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : <Mail size={18} />}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
