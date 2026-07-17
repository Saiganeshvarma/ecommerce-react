import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import { productsAPI } from '../api/products'
import { categoriesAPI } from '../api/categories'
import ProductCard from '../components/products/ProductCard'
import Spinner from '../components/common/Spinner'

export default function HomePage() {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await productsAPI.getFeatured(8)
      return res.data.data.products
    },
    staleTime: 60000,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesAPI.getAll()
      return res.data.data.categories
    },
    staleTime: 300000,
  })

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499' },
    { icon: ShieldCheck, title: 'Secure Payment', desc: 'Razorpay & COD options' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: Zap, title: 'Fast Dispatch', desc: 'Ships within 24 hours' },
  ]

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        color: 'white',
        padding: '5rem 1rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', marginBottom: '1rem' }}>
            🛍️ New Arrivals Every Week
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1rem' }}>
            Shop the Best Deals on ShopZone
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, marginBottom: '2rem' }}>
            Discover thousands of products across top categories at unbeatable prices.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-secondary btn-lg">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/categories" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              Browse Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', padding: '2rem 0' }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius)', padding: '0.625rem', flexShrink: 0 }}>
                  <Icon size={22} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories?.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Shop by Category</h2>
              <Link to="/categories" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  style={{
                    flexShrink: 0, textAlign: 'center', textDecoration: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    overflow: 'hidden', background: 'var(--gray-100)',
                    border: '2px solid var(--gray-200)',
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                  >
                    <img
                      src={cat.image?.url || 'https://placehold.co/80x80?text=' + cat.name[0]}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-700)', whiteSpace: 'nowrap' }}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>⚡ Featured Products</h2>
            <Link to="/products?featured=true" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              See all <ArrowRight size={15} />
            </Link>
          </div>

          {loadingFeatured ? (
            <Spinner center />
          ) : (
            <div className="grid grid-4">
              {featuredData?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--primary)', color: 'white', padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Ready to start shopping?</h2>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>Join thousands of happy customers on ShopZone.</p>
          <Link to="/register" className="btn btn-lg btn-secondary">Create Free Account</Link>
        </div>
      </section>
    </div>
  )
}
