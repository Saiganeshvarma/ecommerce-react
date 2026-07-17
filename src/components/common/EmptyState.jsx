export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={56} />}
      <div>
        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--gray-600)' }}>{title}</p>
        {description && <p style={{ marginTop: '0.25rem' }}>{description}</p>}
      </div>
      {action}
    </div>
  )
}
