export function Tabs({ tabs, activo, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 border-b border-bone-border ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === activo
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-2.5 text-[13px] -mb-px border-b-2 transition-colors ${
              isActive
                ? 'border-zeus-500 text-ink-0 font-medium'
                : 'border-transparent text-ink-2 hover:text-ink-1'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-2 text-[11px] tabular ${
                  isActive ? 'text-zeus-500' : 'text-ink-2'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}