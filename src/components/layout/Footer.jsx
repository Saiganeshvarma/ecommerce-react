import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--gray-900)',
      color: 'var(--gray-400)',
      marginTop: 'auto',
      padding: '2.5rem 0 1.5rem',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--white)', marginBottom: '0.75rem' }}>
              Shop<span style={{ color: 'var(--secondary)' }}>Zone</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
              Your one-stop destination for quality products at great prices.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Shop</div>
            {[['Products', '/products'], ['Categories', '/categories'], ['Deals', '/products?featured=true']].map(([label, href]) => (
              <Link key={href} to={href} style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >{label}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Account</div>
            {[['My Profile', '/profile'], ['My Orders', '/orders'], ['Wishlist', '/wishlist']].map(([label, href]) => (
              <Link key={href} to={href} style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--gray-700)', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} ShopZone. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
