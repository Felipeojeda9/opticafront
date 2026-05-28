import { useEffect, useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'

export function PromptDialog({
  open,
  title = 'Ingresa un valor',
  description,
  label = 'Valor',
  placeholder = '',
  hint,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  required = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [valor, setValor] = useState('')

  useEffect(() => {
    if (open) setValor('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  const handleConfirm = () => {
    if (required && !valor.trim()) return
    onConfirm?.(valor.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-ink-0/40 backdrop-blur-[1px]"
        onClick={() => !loading && onCancel?.()}
      />

      <div className="relative bg-white rounded-xl shadow-zeus-lg w-full max-w-md mx-4 p-6">
        <div className="mb-4">
          <h2 className="text-base font-medium text-ink-0 leading-snug">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-ink-2 mt-1.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <Input
          label={label}
          placeholder={placeholder}
          hint={hint}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) handleConfirm()
          }}
        />

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
            disabled={required && !valor.trim()}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}