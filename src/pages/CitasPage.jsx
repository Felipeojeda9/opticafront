import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

function formatFechaCorta(iso) {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatHora(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function esFutura(iso) {
  return new Date(iso) > new Date()
}

export function CitasPage() {
  const { user } = useAuth()
  const esPaciente = user.rol === 'PACIENTE'

  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [citaACancelar, setCitaACancelar] = useState(null)
  const [cancelando, setCancelando] = useState(false)

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await api.get('/citas')
      setCitas(data)
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

  const { proximas, pasadas } = useMemo(() => {
    const ordenadas = [...citas].sort((a, b) =>
      a.fechaHora.localeCompare(b.fechaHora)
    )
    return {
      proximas: ordenadas.filter((c) => esFutura(c.fechaHora) && c.estado !== 'CANCELADA'),
      pasadas: ordenadas
        .filter((c) => !esFutura(c.fechaHora) || c.estado === 'CANCELADA')
        .reverse(),
    }
  }, [citas])

  if (loading) {
    return <div className="px-10 py-8 text-ink-2 text-sm">Cargando tus citas…</div>
  }

  return (
    <div className="px-10 py-8 max-w-4xl">
      <PageHeader
        eyebrow={esPaciente ? 'Mis citas' : 'Citas asignadas'}
        title={esPaciente ? 'Tus horas con Zeus' : 'Citas asignadas a ti'}
        subtitle={
          proximas.length > 0
            ? `${proximas.length} próxima${proximas.length === 1 ? '' : 's'}`
            : 'Sin citas próximas'
        }
        actions={
          esPaciente && (
            <Link to="/agendar">
              <Button icon="ti-plus">Agendar nueva</Button>
            </Link>
          )
        }
      />

      {error && (
        <Card className="mb-5 border-zeus-200 bg-zeus-50">
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

      {citas.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <i className="ti ti-calendar-off text-3xl text-bone-muted mb-3" />
            <h2 className="text-base font-medium text-ink-0 mb-1">
              {esPaciente ? 'Aún no tienes citas' : 'Sin citas asignadas'}
            </h2>
            <p className="text-sm text-ink-2 mb-5">
              {esPaciente
                ? 'Cuando agendes tu primera hora, aparecerá acá.'
                : 'Cuando se agenden citas contigo, las verás en esta lista.'}
            </p>
            {esPaciente && (
              <Link to="/agendar">
                <Button icon="ti-plus">Agendar mi primera cita</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Próximas */}
          <section className="mb-8">
            <div className="mb-3">
              <div className="eyebrow mb-1">Por venir</div>
              <h2 className="text-lg font-medium text-ink-0">Próximas citas</h2>
            </div>

            {proximas.length === 0 ? (
              <Card>
                <div className="flex items-center gap-3 text-ink-2 text-sm py-2">
                  <i className="ti ti-calendar text-xl text-bone-muted" />
                  <span>No tienes citas próximas.</span>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {proximas.map((c) => (
                  <CitaCard
                    key={c.id}
                    cita={c}
                    esPaciente={esPaciente}
                    onCancelar={() => setCitaACancelar(c)}
                    destacar
                  />
                ))}
              </div>
            )}
          </section>

          {/* Pasadas */}
          {pasadas.length > 0 && (
            <section>
              <div className="mb-3">
                <div className="eyebrow mb-1">Historial</div>
                <h2 className="text-lg font-medium text-ink-0">
                  Citas anteriores
                  <span className="text-ink-2 font-normal text-sm ml-2 tabular">
                    ({pasadas.length})
                  </span>
                </h2>
              </div>
              <div className="space-y-2">
                {pasadas.map((c) => (
                  <CitaCard
                    key={c.id}
                    cita={c}
                    esPaciente={esPaciente}
                    onCancelar={() => setCitaACancelar(c)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!citaACancelar}
        title="¿Cancelar esta cita?"
        description={
          citaACancelar
            ? `Se cancelará la cita ${esPaciente ? 'con ' + (citaACancelar.profesional?.nombre ?? 'el profesional') : 'de ' + (citaACancelar.paciente?.nombre ?? 'el paciente')} del ${formatFechaCorta(citaACancelar.fechaHora)} a las ${formatHora(citaACancelar.fechaHora)}. Esta acción no se puede deshacer.`
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

function CitaCard({ cita, esPaciente, onCancelar, destacar = false }) {
  const cancelada = cita.estado === 'CANCELADA'
  const pasada = !esFutura(cita.fechaHora)
  const inactiva = cancelada || pasada

  const contraparte = esPaciente
    ? cita.profesional
    : cita.paciente

  const contraparteRol = esPaciente
    ? cita.profesional?.especialidad
    : 'Paciente'

  return (
    <Card
      padding="none"
      className={`overflow-hidden ${inactiva ? 'opacity-70' : ''}`}
    >
      <div
        className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 ${
          destacar && !inactiva
            ? 'border-l-[3px] border-zeus-500'
            : ''
        }`}
      >
        {/* Fecha / hora */}
        <div className="text-center min-w-[60px]">
          <div className="text-[10px] uppercase tracking-[1px] text-ink-2">
            {new Date(cita.fechaHora).toLocaleDateString('es-CL', { month: 'short' })}
          </div>
          <div className="text-2xl font-medium text-ink-0 leading-none tabular my-0.5">
            {new Date(cita.fechaHora).getDate()}
          </div>
          <div className="text-[11px] text-ink-2 font-mono tabular">
            {formatHora(cita.fechaHora)}
          </div>
        </div>

        {/* Contraparte */}
        <div className="min-w-0">
          <div className="text-[10px] text-ink-2 uppercase tracking-[1px] mb-0.5">
            {contraparteRol ?? (esPaciente ? 'Profesional' : 'Paciente')}
          </div>
          <div className="text-[14px] font-medium text-ink-1 truncate">
            {contraparte?.nombre ?? '—'}
          </div>
          <div className="text-[11px] text-ink-2 capitalize mt-0.5">
            {formatFechaCorta(cita.fechaHora)}
          </div>
        </div>

        {/* Estado + acción */}
        <div className="flex flex-col items-end gap-2">
          <Badge estado={cita.estado}>{cita.estado.toLowerCase()}</Badge>
          {!cancelada && !pasada && (
            <button
              onClick={onCancelar}
              className="text-[12px] text-ink-2 hover:text-zeus-600 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}