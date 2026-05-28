const VARIANTES = {
  pending:   'bg-state-pending-bg text-state-pending-text',
  confirmed: 'bg-state-confirmed-bg text-state-confirmed-text',
  cancelled: 'bg-state-cancelled-bg text-state-cancelled-text',
  info:      'bg-state-info-bg text-state-info-text',
  zeus:      'bg-zeus-100 text-zeus-700',
  neutral:   'bg-bone-surface text-ink-2',
}

// Mapeo automático de estados del backend al variant
const ESTADO_A_VARIANTE = {
  PENDIENTE:   'pending',
  CONFIRMADA:  'confirmed',
  CANCELADA:   'cancelled',
  COMPLETADA:  'confirmed',
}

export function Badge({ children, variant = 'neutral', estado, className = '' }) {
  // Si pasan `estado`, lo traduce. Si no, usa `variant` directo.
  const v = estado ? (ESTADO_A_VARIANTE[estado] || 'neutral') : variant

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-medium uppercase tracking-[0.5px] ${VARIANTES[v]} ${className}`}
    >
      {children}
    </span>
  )
}