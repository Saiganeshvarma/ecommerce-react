import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i)
    }
  }

  // Insert ellipsis
  const withEllipsis = []
  let prev = null
  for (const p of pages) {
    if (prev && p - prev > 1) {
      withEllipsis.push('...')
    }
    withEllipsis.push(p)
    prev = p
  }

  return (
    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {withEllipsis.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem', color: 'var(--gray-400)' }}>…</span>
        ) : (
          <button
            key={p}
            className="btn btn-sm"
            onClick={() => onPageChange(p)}
            style={{
              background: p === page ? 'var(--primary)' : 'var(--white)',
              color: p === page ? 'var(--white)' : 'var(--gray-700)',
              border: '1.5px solid',
              borderColor: p === page ? 'var(--primary)' : 'var(--gray-200)',
              minWidth: '36px',
              justifyContent: 'center',
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
