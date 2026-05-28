export function Card({ children, className = '', padding = 'md', ...rest }) {
  const paddings = {
    none: '',
    sm:   'p-3',
    md:   'p-5',
    lg:   'p-6',
  }

  return (
    <div
      className={`bg-white border border-bone-border rounded-lg ${paddings[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ eyebrow, title, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        {title && <h2 className="text-base font-medium text-ink-0">{title}</h2>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}