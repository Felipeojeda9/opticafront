export function Select({
  label,
  error,
  hint,
  className = '',
  id,
  children,
  ...rest
}) {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-ink-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full h-9 pl-3 pr-9 text-[13px] text-ink-1
            bg-white border rounded-md transition-colors appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-zeus-200 focus:border-zeus-400
            disabled:bg-bone-surface disabled:cursor-not-allowed
            ${error ? 'border-zeus-400' : 'border-bone-border'}`}
          {...rest}
        >
          {children}
        </select>
        <i
          className="ti ti-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-base text-ink-2 pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && <span className="text-[11px] text-zeus-600">{error}</span>}
      {hint && !error && <span className="text-[11px] text-ink-2">{hint}</span>}
    </div>
  )
}