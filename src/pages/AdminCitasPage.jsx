import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

function formatFecha(iso) {
  return new Date(iso).toLocaleString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminCitasPage() {
  const [citas, setCitas] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroProf, setFiltroProf] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  // Estado del diálogo de cancelación
  const [citaACancelar, setCitaACancelar] = useState(null)
  const [cancelando, setCancelando] = useState(false)

  const cargar = async () => {
    try {
      setLoading(true)
      const [c, p] = await Promise.all([
        api.get('/citas'),
        api.get('/users/profesionales'),
      ])
      setCitas(c)
      setProfesionales(p)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const confirmarCancelacion = async () => {
    if (!citaACancelar) return
    try {
      setCancelando(true)
      await api.patch(`/citas/${citaACancelar.id}/cancelar`)
      await cargar()
      setCitaACancelar(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelando(false)
    }
  }

  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      if (filtroProf && c.profesionalId !== Number(filtroProf)) return false
      if (filtroEstado && c.estado !== filtroEstado) return false
      return true
    })
  }, [citas, filtroProf, filtroEstado])

  const hayFiltros = filtroProf || filtroEstado

  if (loading) {
    return <div className="px-10 py-8 text-ink-2 text-sm">Cargando citas…</div>
  }

  return (
    <div className="px-10 py-8 max-w-6xl">
      <PageHeader
        eyebrow="Gestión"
        title="Todas las citas"
        subtitle={`${citas.length} citas registradas`}
        actions={
          <Link to="/admin/citas/nueva">
            <Button icon="ti-plus">Nueva cita</Button>
          </Link>
        }
      />

      {error && (
        <Card className="mb-6 border-zeus-200 bg-zeus-50">
          <div className="flex items-start gap-3">
            <i className="ti ti-alert-circle text-zeus-500 text-xl mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-zeus-700">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-zeus-500 hover:text-zeus-700"
              aria-label="Cerrar"
            >
              <i className="ti ti-x text-base" />
            </button>
          </div>
        </Card>
      )}

      <Card padding="sm" className="mb-5">
        <div className="flex items-end gap-3 flex-wrap">
          <Select
            label="Profesional"
            value={filtroProf}
            onChange={(e) => setFiltroProf(e.target.value)}
            className="min-w-[200px]"
          >
            <option value="">Todos</option>
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </Select>

          <Select
            label="Estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="min-w-[180px]"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="CANCELADA">Cancelada</option>
          </Select>

          {hayFiltros && (
            <Button
              variant="ghost"
              size="sm"
              icon="ti-x"
              onClick={() => {
                setFiltroProf('')
                setFiltroEstado('')
              }}
            >
              Limpiar
            </Button>
          )}

          <div className="ml-auto text-xs text-ink-2">
            {citasFiltradas.length} de {citas.length}
          </div>
        </div>
      </Card>

      {/* Tabla */}
      {citasFiltradas.length === 0 ? (
        <Card>
          <div className="flex items-center gap-3 text-ink-2 text-sm py-2">
            <i className="ti ti-search-off text-xl text-bone-muted" />
            <span>
              {hayFiltros
                ? 'No hay citas con esos filtros.'
                : 'No hay citas registradas.'}
            </span>
          </div>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-bone-surface text-left text-[11px] uppercase tracking-[0.5px] font-medium text-ink-2">
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Paciente</th>
                <th className="py-2.5 px-4">Profesional</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((c, i) => {
                const ultimo = i === citasFiltradas.length - 1
                const cancelada = c.estado === 'CANCELADA'
                return (
                  <tr
                    key={c.id}
                    className={`${!ultimo ? 'border-b border-bone-border' : ''} ${
                      cancelada ? 'opacity-60' : ''
                    } hover:bg-bone-bg transition-colors`}
                  >
                    <td className="py-3 px-4 capitalize text-ink-1">
                      {formatFecha(c.fechaHora)}
                    </td>
                    <td className="py-3 px-4 text-ink-1">
                      {c.paciente?.nombre ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-ink-2">
                      {c.profesional?.nombre ?? '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge estado={c.estado}>{c.estado.toLowerCase()}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!cancelada && (
                        <button
                          onClick={() => setCitaACancelar(c)}
                          className="text-[13px] text-ink-2 hover:text-zeus-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={!!citaACancelar}
        title="¿Cancelar esta cita?"
        description={
          citaACancelar
            ? `Se cancelará la cita de ${citaACancelar.paciente?.nombre ?? 'paciente'} con ${citaACancelar.profesional?.nombre ?? 'profesional'} del ${formatFecha(citaACancelar.fechaHora)}. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        loading={cancelando}
        onConfirm={confirmarCancelacion}
        onCancel={() => !cancelando && setCitaACancelar(null)}
      />
    </div>
  )
}