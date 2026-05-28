export function Input({
  label,
  error,
  icon,
  hint,
  className = '',
  id,
  ...rest
}) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-ink-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <i
            className={`ti ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-base text-ink-2 pointer-events-none`}
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          className={`w-full h-9 ${icon ? 'pl-9' : 'pl-3'} pr-3 text-[13px] text-ink-1
            bg-white border rounded-md transition-colors
            placeholder:text-bone-muted
            focus:outline-none focus:ring-2 focus:ring-zeus-200 focus:border-zeus-400
            disabled:bg-bone-surface disabled:cursor-not-allowed
            ${error ? 'border-zeus-400' : 'border-bone-border'}`}
          {...rest}
        />
      </div>
      {error && <span className="text-[11px] text-zeus-600">{error}</span>}
      {hint && !error && <span className="text-[11px] text-ink-2">{hint}</span>}
    </div>
  )
}