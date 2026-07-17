import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import ProductCard from '../components/products/ProductCard'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'

export default function WishlistPage() {
  const { wishlist, isLoading } = useWishlist()

  if (isLoading) return <Spinner center />

  const products = wishlist?.products || []

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="page-title">My Wishlist</h1>

      {products.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love and come back to them anytime."
            action={<Link to="/products" className="btn btn-primary">Browse Products</Link>}
          />
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            {products.length} saved item(s)
          </p>
          <div className="grid grid-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
