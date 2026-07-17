import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown, Search, Package } from 'lucide-react'
import { productsAPI } from '../api/products'
import { categoriesAPI } from '../api/categories'
import ProductCard from '../components/products/ProductCard'
import Spinner from '../components/common/Spinner'
import Pagination from '../components/common/Pagination'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const page = parseInt(searchParams.get('page') || '1')
  const filters = {
    search:    searchParams.get('search')    || '',
    category:  searchParams.get('category')  || '',
    brand:     searchParams.get('brand')     || '',
    minPrice:  searchParams.get('minPrice')  || '',
    maxPrice:  searchParams.get('maxPrice')  || '',
    minRating: searchParams.get('minRating') || '',
    sort:      searchParams.get('sort')      || '',
  }

  const [localFilters, setLocalFilters] = useState(filters)
  useEffect(() => { setLocalFilters(filters) }, [searchParams]) // eslint-disable-line

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { ...filters, page }],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries({ ...filters, page, limit: 12 }).filter(([, v]) => v !== '')
      )
      const res = await productsAPI.getAll(params)
      return res.data.data
    },
    staleTime: 30000,
    keepPreviousData: true,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesAPI.getAll()
      return res.data.data.categories
    },
    staleTime: 300000,
  })

  const applyFilters = useCallback(() => {
    const p = {}
    Object.entries(localFilters).forEach(([k, v]) => { if (v) p[k] = v })
    p.page = '1'
    setSearchParams(p)
    setDrawerOpen(false)
  }, [localFilters, setSearchParams])

  const clearFilters = () => {
    const cleared = { search: '', category: '', brand: '', minPrice: '', maxPrice: '', minRating: '', sort: '' }
    setLocalFilters(cleared)
    setSearchParams({})
  }

  const removeFilter = (key) => {
    const next = { ...Object.fromEntries(searchParams) }
    delete next[key]
    next.page = '1'
    setSearchParams(next)
  }

  const hasFilters = Object.entries(filters).some(([k, v]) => v && k !== 'sort')

  const sortOptions = [
    { value: '',          label: 'Relevance' },
    { value: 'price',     label: 'Price: Low → High' },
    { value: '-price',    label: 'Price: High → Low' },
    { value: '-rating',   label: 'Top Rated' },
    { value: '-createdAt', label: 'Newest First' },
  ]

  const activeChips = [
    filters.search    && { key: 'search',    label: `"${filters.search}"` },
    filters.category  && { key: 'category',  label: categories?.find(c => c._id === filters.category)?.name || 'Category' },
    filters.brand     && { key: 'brand',     label: filters.brand },
    filters.minPrice  && { key: 'minPrice',  label: `Min ₹${filters.minPrice}` },
    filters.maxPrice  && { key: 'maxPrice',  label: `Max ₹${filters.maxPrice}` },
    filters.minRating && { key: 'minRating', label: `${filters.minRating}★+` },
  ].filter(Boolean)

  return (
    <div className="container" style={{ padding: '1.75rem 1rem 3rem' }}>

      {/* ── Page header ─────────────────────────────────── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1.2 }}>
          {filters.search ? <>Results for <em style={{ fontStyle: 'normal', color: 'var(--primary)' }}>"{filters.search}"</em></> : 'All Products'}
        </h1>
        {data && (
          <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: '0.3rem' }}>
            {data.pagination?.total ?? 0} products found
          </p>
        )}
      </div>

      {/* ── Active filter chips ──────────────────────────── */}
      {activeChips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {activeChips.map(({ key, label }) => (
            <span key={key} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'var(--primary-light)', color: 'var(--primary)',
              padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem', fontWeight: 600,
            }}>
              {label}
              <button onClick={() => removeFilter(key)} style={{ display: 'flex', color: 'var(--primary)', opacity: 0.7, padding: 0 }}>
                <X size={12} />
              </button>
            </span>
          ))}
          <button onClick={clearFilters} style={{
            fontSize: '0.78rem', color: 'var(--gray-500)', textDecoration: 'underline',
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem',
          }}>
            Clear all
          </button>
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap',
      }}>
        {/* Mobile filter button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setDrawerOpen(true)}
          style={{ display: 'flex' }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && (
            <span style={{
              background: 'var(--primary)', color: 'white',
              borderRadius: 'var(--radius-full)', fontSize: '0.65rem',
              padding: '0.1rem 0.4rem', fontWeight: 700, lineHeight: 1.4,
            }}>
              {activeChips.length}
            </span>
          )}
        </button>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>Sort by</span>
          <div style={{ position: 'relative' }}>
            <select
              className="form-select"
              value={filters.sort}
              onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), sort: e.target.value, page: '1' })}
              style={{ paddingRight: '2rem', appearance: 'none', minWidth: 160 }}
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gray-400)' }} />
          </div>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* ── Desktop sidebar ──────────────────────────── */}
        <aside style={{
          width: 232, flexShrink: 0,
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow)',
          position: 'sticky', top: 80, alignSelf: 'flex-start',
          minWidth: 0,
        }}
          className="products-sidebar"
        >
          <div style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Filters</span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Clear all
              </button>
            )}
          </div>
          <div style={{ padding: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
            <FilterFields
              localFilters={localFilters}
              setLocalFilters={setLocalFilters}
              categories={categories}
              onApply={applyFilters}
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* ── Filter drawer (mobile) ────────────────────── */}
        {drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
            />
            <div style={{
              position: 'fixed', left: 0, top: 0, bottom: 0, width: 300, maxWidth: '85vw',
              background: 'var(--white)', zIndex: 1001, overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Filters</span>
                <button onClick={() => setDrawerOpen(false)} style={{ color: 'var(--gray-500)', padding: 4 }}><X size={20} /></button>
              </div>
              <div style={{ padding: '1.25rem', flex: 1 }}>
                <FilterFields
                  localFilters={localFilters}
                  setLocalFilters={setLocalFilters}
                  categories={categories}
                  onApply={applyFilters}
                  hasFilters={hasFilters}
                  onClear={clearFilters}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Product grid ─────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isLoading ? (
            <Spinner center />
          ) : data?.products?.length === 0 ? (
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow)', padding: '4rem 2rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '1rem', textAlign: 'center',
            }}>
              <div style={{ width: 64, height: 64, background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={28} color="var(--gray-300)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gray-700)' }}>No products found</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>Try adjusting your filters or search term</div>
              </div>
              {hasFilters && (
                <button className="btn btn-outline btn-sm" onClick={clearFilters}>Clear Filters</button>
              )}
            </div>
          ) : (
            <>
              {/* subtle fetching indicator */}
              {isFetching && !isLoading && (
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-400)', fontSize: '0.8rem' }}>
                  <div className="spinner spinner-sm" /> Updating…
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.1rem',
              }}>
                {data?.products?.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div style={{ marginTop: '2rem' }}>
                <Pagination
                  page={page}
                  totalPages={data?.pagination?.totalPages || 1}
                  onPageChange={(p) => {
                    setSearchParams({ ...Object.fromEntries(searchParams), page: String(p) })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Sidebar responsive hide ───────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .products-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function FilterFields({ localFilters, setLocalFilters, categories, onApply, hasFilters, onClear }) {
  const set = (key, val) => setLocalFilters((prev) => ({ ...prev, [key]: val }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Search */}
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Search
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            className="form-input"
            placeholder="Product name…"
            value={localFilters.search}
            onChange={(e) => set('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
            style={{ paddingLeft: '2rem', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Category
        </label>
        <select
          className="form-select"
          style={{ width: '100%', boxSizing: 'border-box' }}
          value={localFilters.category}
          onChange={(e) => set('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Brand
        </label>
        <input
          className="form-input"
          placeholder="e.g. Samsung"
          value={localFilters.brand}
          onChange={(e) => set('brand', e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Price Range */}
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Price Range (₹)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            className="form-input"
            type="number"
            placeholder="Min price"
            min={0}
            value={localFilters.minPrice}
            onChange={(e) => set('minPrice', e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Max price"
            min={0}
            value={localFilters.maxPrice}
            onChange={(e) => set('maxPrice', e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Min Rating
        </label>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['', '1', '2', '3', '4'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set('minRating', r)}
              style={{
                padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid',
                borderColor: localFilters.minRating === r ? 'var(--primary)' : 'var(--gray-200)',
                background: localFilters.minRating === r ? 'var(--primary)' : 'var(--white)',
                color: localFilters.minRating === r ? 'white' : 'var(--gray-600)',
                cursor: 'pointer', transition: 'all 0.1s',
              }}
            >
              {r === '' ? 'Any' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={onApply}>
          Apply Filters
        </button>
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={onClear} title="Clear filters">
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
