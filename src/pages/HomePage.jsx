import { useEffect, useState, useMemo } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

function formatHora(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFechaLarga(iso) {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function hoyISO() {
  return new Date().toISOString().split('T')[0]
}

function saludoSegunHora() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function HomePage() {
  const { user, loading: loadingAuth } = useAuth()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || user.rol === 'ADMIN') return
    api.get('/citas')
      .then(setCitas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  const { proximaCita, citasHoy, totalActivas } = useMemo(() => {
    const ahora = new Date()
    const hoy = hoyISO()

    const activas = citas.filter((c) => c.estado !== 'CANCELADA')
    const futuras = activas
      .filter((c) => new Date(c.fechaHora) > ahora)
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))

    const delDia = activas
      .filter((c) => c.fechaHora.split('T')[0] === hoy)
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))

    return {
      proximaCita: futuras[0] || null,
      citasHoy: delDia,
      totalActivas: futuras.length,
    }
  }, [citas])

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-2 text-sm">
        Cargando...
      </div>
    )
  }

  if (user?.rol === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  const esPaciente = user?.rol === 'PACIENTE'
  const esProfesional = user?.rol === 'PROFESIONAL'
  const nombrePila = user?.nombre?.split(' ')[0] || ''

  return (
    <div className="px-10 py-8 max-w-5xl">
      <PageHeader
        eyebrow={saludoSegunHora()}
        title={`Hola, ${nombrePila}`}
        subtitle={formatFechaLarga(new Date().toISOString())}
        actions={
          esPaciente && (
            <Link to="/agendar">
              <Button icon="ti-plus">Agendar hora</Button>
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
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="eyebrow mb-2">
            {esPaciente ? 'Tu próxima cita' : 'Tu próxima atención'}
          </div>

          {loading ? (
            <Card>
              <p className="text-sm text-ink-2">Cargando...</p>
            </Card>
          ) : proximaCita ? (
            <ProximaCita cita={proximaCita} esPaciente={esPaciente} />
          ) : (
            <SinCita esPaciente={esPaciente} />
          )}
        </div>

        <aside className="space-y-3">
          <div className="eyebrow mb-2">Atajos</div>

          {esPaciente && (
            <>
              <AtajoCard
                to="/agendar"
                icon="ti-calendar-plus"
                titulo="Agendar nueva hora"
                descripcion="Elige profesional, día y horario."
                destacar
              />
              <AtajoCard
                to="/citas"
                icon="ti-calendar-event"
                titulo="Mis citas"
                descripcion={
                  totalActivas > 0
                    ? `Tienes ${totalActivas} próxima${totalActivas === 1 ? '' : 's'}.`
                    : 'Ver historial y citas activas.'
                }
              />
            </>
          )}

          {esProfesional && (
            <>
              <AtajoCard
                to="/mi-agenda"
                icon="ti-calendar-time"
                titulo="Mi agenda"
                descripcion="Revisar y bloquear horarios."
                destacar
              />
              <AtajoCard
                to="/citas"
                icon="ti-calendar-event"
                titulo="Citas asignadas"
                descripcion={
                  totalActivas > 0
                    ? `Tienes ${totalActivas} pacientes por venir.`
                    : 'Ver tu historial de citas.'
                }
              />
              <AtajoCard
                to="/usuarios/nuevo"
                icon="ti-user-plus"
                titulo="Nuevo paciente"
                descripcion="Registrar paciente en el sistema."
              />
            </>
          )}
        </aside>
      </div>

      {esProfesional && !loading && citasHoy.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="eyebrow mb-1">Agenda del día</div>
              <h2 className="text-lg font-medium text-ink-0">
                Hoy
                <span className="text-ink-2 font-normal text-sm ml-2 tabular">
                  ({citasHoy.length})
                </span>
              </h2>
            </div>
            <Link to="/mi-agenda">
              <Button variant="ghost" size="sm" iconRight="ti-arrow-right">
                Ver agenda completa
              </Button>
            </Link>
          </div>

          <Card padding="none">
            {citasHoy.map((c, i) => {
              const ultimo = i === citasHoy.length - 1
              const pasada = new Date(c.fechaHora) < new Date()
              return (
                <div
                  key={c.id}
                  className={`grid grid-cols-[70px_1fr_auto] items-center gap-4 px-4 py-3 ${
                    !ultimo ? 'border-b border-bone-border' : ''
                  } ${pasada ? 'opacity-60' : ''}`}
                >
                  <span className="font-mono text-[13px] text-ink-1 tabular font-medium">
                    {formatHora(c.fechaHora)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] text-ink-1 truncate font-medium">
                      {c.paciente?.nombre ?? 'Paciente'}
                    </div>
                    <div className="text-[11px] text-ink-2 capitalize">
                      {pasada ? 'Atendida' : 'Por atender'}
                    </div>
                  </div>
                  <Badge estado={c.estado}>{c.estado.toLowerCase()}</Badge>
                </div>
              )
            })}
          </Card>
        </section>
      )}
    </div>
  )
}

function ProximaCita({ cita, esPaciente }) {
  const fecha = new Date(cita.fechaHora)
  const ahora = new Date()
  const msDelta = fecha - ahora
  const horasDelta = Math.floor(msDelta / (1000 * 60 * 60))
  const diasDelta = Math.floor(horasDelta / 24)

  let cuandoTexto = ''
  if (diasDelta === 0) {
    if (horasDelta < 1) cuandoTexto = 'en menos de una hora'
    else cuandoTexto = `en ${horasDelta} ${horasDelta === 1 ? 'hora' : 'horas'}`
  } else if (diasDelta === 1) {
    cuandoTexto = 'mañana'
  } else if (diasDelta < 7) {
    cuandoTexto = `en ${diasDelta} días`
  } else {
    cuandoTexto = `en ${Math.floor(diasDelta / 7)} ${Math.floor(diasDelta / 7) === 1 ? 'semana' : 'semanas'}`
  }

  const contraparte = esPaciente ? cita.profesional : cita.paciente
  const labelContraparte = esPaciente
    ? cita.profesional?.especialidad
    : 'Paciente'

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="bg-zeus-500 text-white px-6 py-5">
        <div className="text-[11px] uppercase tracking-[1.5px] opacity-80 mb-1">
          {cuandoTexto}
        </div>
        <div className="font-serif text-3xl leading-tight capitalize">
          {formatFechaLarga(cita.fechaHora)}
        </div>
        <div className="font-mono text-2xl tabular mt-1">
          {formatHora(cita.fechaHora)} hrs
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
          <div>
            <div className="text-[10px] uppercase tracking-[1px] text-ink-2 mb-1">
              {labelContraparte ?? (esPaciente ? 'Profesional' : 'Paciente')}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zeus-100 text-zeus-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {(contraparte?.nombre || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] text-ink-0 font-medium truncate">
                  {contraparte?.nombre ?? '—'}
                </div>
                <Badge estado={cita.estado} className="mt-1">
                  {cita.estado.toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>

          <Link to="/citas">
            <Button variant="secondary" size="sm" iconRight="ti-arrow-right">
              Ver detalles
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

function SinCita({ esPaciente }) {
  return (
    <Card>
      <div className="text-center py-8">
        <i className="ti ti-calendar-off text-3xl text-bone-muted mb-3" />
        <h2 className="text-base font-medium text-ink-0 mb-1">
          {esPaciente ? 'No tienes citas próximas' : 'Sin atenciones próximas'}
        </h2>
        <p className="text-sm text-ink-2 mb-5 max-w-xs mx-auto">
          {esPaciente
            ? 'Agenda una hora para tu próxima consulta visual.'
            : 'Cuando se agenden citas contigo, aparecerán aquí.'}
        </p>
        {esPaciente && (
          <Link to="/agendar">
            <Button icon="ti-plus">Agendar ahora</Button>
          </Link>
        )}
      </div>
    </Card>
  )
}

function AtajoCard({ to, icon, titulo, descripcion, destacar = false }) {
  return (
    <Link to={to} className="block group">
      <Card
        padding="sm"
        className={`transition-colors ${
          destacar
            ? 'bg-zeus-50 border-zeus-200 hover:border-zeus-400'
            : 'hover:border-zeus-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
            destacar
              ? 'bg-zeus-500 text-white'
              : 'bg-bone-surface text-ink-2 group-hover:bg-zeus-100 group-hover:text-zeus-600 transition-colors'
          }`}>
            <i className={`ti ${icon} text-lg`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-ink-0 leading-tight">
              {titulo}
            </div>
            <div className="text-[11px] text-ink-2 mt-1 leading-snug">
              {descripcion}
            </div>
          </div>
          <i className="ti ti-arrow-right text-base text-ink-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Card>
    </Link>
  )
}