import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, Menu, X, Package, LayoutDashboard, LogOut } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import { authAPI } from '../../api/auth'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { itemCount } = useCartStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch (_) { /* ignore */ }
    logout()
    navigate('/')
    toast.success('Logged out')
    setProfileOpen(false)
  }

  return (
    <nav style={{
      background: 'var(--white)',
      borderBottom: '1px solid var(--gray-200)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: '1rem' }}>
        {/* Logo */}
        <Link to="/" style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)', flexShrink: 0 }}>
          Shop<span style={{ color: 'var(--secondary)' }}>Zone</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, display: 'flex', gap: 0 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: 'var(--radius) 0 0 var(--radius)', flex: 1, margin: 0 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: '0 var(--radius) var(--radius) 0', padding: '0 1rem' }}
          >
            <Search size={16} />
          </button>
        </form>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          {/* Wishlist */}
          {isAuthenticated && (
            <Link to="/wishlist" className="btn btn-ghost" style={{ position: 'relative' }}>
              <Heart size={20} />
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="btn btn-ghost" style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                background: 'var(--danger)', color: 'white',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {user?.profileImage?.url ? (
                  <img
                    src={user.profileImage.url}
                    alt={user.name}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.75rem',
                  }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: '0.875rem', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                    onClick={() => setProfileOpen(false)}
                  />
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    background: 'white', borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)',
                    minWidth: 180, zIndex: 50, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{user?.email}</div>
                    </div>
                    {[
                      { to: '/profile', icon: User, label: 'Profile' },
                      { to: '/orders', icon: Package, label: 'My Orders' },
                      ...(user?.role === 'admin' ? [{ to: '/admin', icon: LayoutDashboard, label: 'Admin' }] : []),
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.625rem',
                          padding: '0.625rem 1rem', fontSize: '0.875rem',
                          color: 'var(--gray-700)',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Icon size={15} /> {label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.625rem 1rem', fontSize: '0.875rem',
                        color: 'var(--danger)', width: '100%', textAlign: 'left',
                        borderTop: '1px solid var(--gray-100)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
