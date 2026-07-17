import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Grid } from 'lucide-react'
import { categoriesAPI } from '../api/categories'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesAPI.getAll()
      return res.data.data.categories
    },
    staleTime: 300000,
  })

  if (isLoading) return <Spinner center />

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="page-title">All Categories</h1>

      {!categories?.length ? (
        <EmptyState icon={Grid} title="No categories found" />
      ) : (
        <div className="grid grid-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="card"
                style={{
                  padding: 0, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow)'
                }}
              >
                <div style={{ aspectRatio: '16/9', background: 'var(--gray-100)', overflow: 'hidden' }}>
                  <img
                    src={cat.image?.url || `https://placehold.co/320x180?text=${cat.name}`}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-800)' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem', fontWeight: 500 }}>
                    Browse products →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
