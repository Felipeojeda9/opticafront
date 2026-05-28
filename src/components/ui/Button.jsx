const VARIANTES = {
  primary:   'bg-zeus-500 text-white hover:bg-zeus-600 active:bg-zeus-700 border border-transparent',
  secondary: 'bg-white text-ink-1 border border-bone-border hover:bg-bone-surface',
  ghost:     'bg-transparent text-zeus-500 hover:text-zeus-700 border border-transparent',
  danger:    'bg-white text-zeus-600 border border-zeus-200 hover:bg-zeus-50',
}

const TAMANOS = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-[13px]',
  lg: 'h-11 px-5 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium ' +
    'transition-colors disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zeus-400'

  return (
    <button
      className={`${base} ${VARIANTES[variant]} ${TAMANOS[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <i className="ti ti-loader-2 animate-spin text-base" aria-hidden="true" />
      ) : (
        icon && <i className={`ti ${icon} text-base`} aria-hidden="true" />
      )}
      <span>{children}</span>
      {iconRight && !loading && (
        <i className={`ti ${iconRight} text-base`} aria-hidden="true" />
      )}
    </button>
  )
}