export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="flex items-end justify-between mb-8 pb-5 border-b border-bone-border">
      <div>
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="font-serif text-3xl text-ink-0 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-2 mt-1.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}