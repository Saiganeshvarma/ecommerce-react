import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, size = 16, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="stars" style={{ cursor: interactive ? 'pointer' : 'default' }}>
      {stars.map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? '#f59e0b' : 'none'}
          stroke={star <= rating ? '#f59e0b' : '#d1d5db'}
          onClick={interactive && onChange ? () => onChange(star) : undefined}
          style={{ transition: 'transform 0.1s' }}
        />
      ))}
    </div>
  )
}
