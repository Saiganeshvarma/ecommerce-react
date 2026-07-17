export default function Spinner({ size = 'md', center = false }) {
  const cls = size === 'sm' ? 'spinner spinner-sm' : 'spinner'
  if (center) {
    return (
      <div className="loading-center">
        <div className={cls} />
      </div>
    )
  }
  return <div className={cls} />
}
