import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Users, ShoppingBag, ArrowLeft, Ticket,
} from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/coupons', icon: Ticket, label: 'Coupons' },
]

export default function AdminLayout() {
  const { pathname } = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--gray-900)', color: 'white',
        padding: '1.5rem 0',
        position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto',
      }}>
        <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', marginBottom: '0.25rem' }}>Admin Panel</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Manage your store</div>
        </div>

        <nav>
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: active ? 'white' : 'var(--gray-400)',
                  borderLeft: `3px solid ${active ? 'var(--primary)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={17} /> {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.25rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
            <ArrowLeft size={14} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '2rem', background: 'var(--gray-50)', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
