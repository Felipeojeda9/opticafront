import { useEffect } from 'react'
import { Button } from './Button'

export function ConfirmDialog({
  open,
  title = '¿Confirmar acción?',
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  // Cerrar con ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-0/40 backdrop-blur-[1px]"
        onClick={() => !loading && onCancel?.()}
      />

      {/* Diálogo */}
      <div className="relative bg-white rounded-xl shadow-zeus-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-zeus-50 flex items-center justify-center flex-shrink-0">
            <i className="ti ti-alert-triangle text-zeus-500 text-xl" />
          </div>
          <div className="flex-1 pt-1">
            <h2 className="text-base font-medium text-ink-0 leading-snug">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-ink-2 mt-1.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}