import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
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

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function hoyISO() {
  return new Date().toISOString().split('T')[0]
}
function sumarDias(diasISO, n) {
  const d = new Date(diasISO)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export function AdminDashboardPage() {
  const [citas, setCitas] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/citas'),
      api.get('/users/pacientes'),
      api.get('/users/profesionales'),
    ])
      .then(([c, pac, prof]) => {
        setCitas(c)
        setPacientes(pac)
        setProfesionales(prof)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const { citasHoy, citasSemana, totalPendientes } = useMemo(() => {
    const hoy = hoyISO()
    const limite = sumarDias(hoy, 7)

    const activas = citas.filter((c) => c.estado !== 'CANCELADA')

    const hoyArr = activas
      .filter((c) => c.fechaHora.split('T')[0] === hoy)
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))

    const semanaArr = activas
      .filter((c) => {
        const f = c.fechaHora.split('T')[0]
        return f > hoy && f <= limite
      })
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))

    return {
      citasHoy: hoyArr,
      citasSemana: semanaArr,
      totalPendientes: activas.filter((c) => c.estado === 'PENDIENTE').length,
    }
  }, [citas])

  if (loading) {
    return (
      <div className="px-10 py-8 text-ink-2 text-sm">Cargando panel…</div>
    )
  }

  if (error) {
    return (
      <div className="px-10 py-8">
        <Card>
          <div className="flex items-start gap-3">
            <i className="ti ti-alert-circle text-zeus-500 text-xl mt-0.5" />
            <div>
              <h2 className="text-base font-medium text-ink-0 mb-1">
                No pudimos cargar el panel
              </h2>
              <p className="text-sm text-ink-2">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-10 py-8 max-w-6xl">
      <PageHeader
        eyebrow="Panel"
        title="Resumen general"
        subtitle={formatFecha(new Date().toISOString())}
        actions={
          <Link to="/admin/citas/nueva">
            <Button icon="ti-plus">Nueva cita</Button>
          </Link>
        }
      />

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <Stat
          label="Citas hoy"
          value={citasHoy.length}
          hint={`${totalPendientes} pendientes`}
          to="/admin/citas"
          featured
        />
        <Stat
          label="Próximos 7 días"
          value={citasSemana.length}
          to="/admin/citas"
        />
        <Stat
          label="Pacientes"
          value={pacientes.length}
          to="/admin/usuarios"
        />
        <Stat
          label="Profesionales"
          value={profesionales.length}
          to="/admin/usuarios"
        />
      </div>

      {/* Hoy */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="eyebrow mb-1">Agenda del día</div>
            <h2 className="text-lg font-medium text-ink-0">Hoy</h2>
          </div>
          {citasHoy.length > 0 && (
            <Link to="/admin/citas">
              <Button variant="ghost" size="sm" iconRight="ti-arrow-right">
                Ver todas
              </Button>
            </Link>
          )}
        </div>

        {citasHoy.length === 0 ? (
          <EmptyState
            icon="ti-calendar-off"
            message="Sin citas para hoy."
          />
        ) : (
          <Card padding="none">
            <ul>
              {citasHoy.map((c, i) => (
                <ItemCita
                  key={c.id}
                  cita={c}
                  mostrarFecha={false}
                  ultimo={i === citasHoy.length - 1}
                />
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Próximos 7 días */}
      <section>
        <div className="mb-3">
          <div className="eyebrow mb-1">Vista semanal</div>
          <h2 className="text-lg font-medium text-ink-0">Próximos 7 días</h2>
        </div>

        {citasSemana.length === 0 ? (
          <EmptyState
            icon="ti-calendar"
            message="Sin citas en los próximos 7 días."
          />
        ) : (
          <Card padding="none">
            <ul>
              {citasSemana.map((c, i) => (
                <ItemCita
                  key={c.id}
                  cita={c}
                  mostrarFecha
                  ultimo={i === citasSemana.length - 1}
                />
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, hint, to, featured = false }) {
  const fondo = featured
    ? 'bg-zeus-500 text-white'
    : 'bg-bone-surface text-ink-1'
  const labelColor = featured ? 'text-white/85' : 'text-ink-2'
  const hintColor = featured ? 'text-white/75' : 'text-ink-2'

  return (
    <Link
      to={to}
      className={`${fondo} rounded-lg p-4 transition-opacity hover:opacity-90 block`}
    >
      <div className={`text-[11px] uppercase tracking-[1px] font-medium ${labelColor} mb-1`}>
        {label}
      </div>
      <div className="text-3xl font-medium leading-none tabular">{value}</div>
      {hint && (
        <div className={`text-[11px] mt-2 ${hintColor}`}>{hint}</div>
      )}
    </Link>
  )
}

function ItemCita({ cita, mostrarFecha, ultimo }) {
  return (
    <li
      className={`grid items-center gap-4 px-4 py-3 ${
        mostrarFecha
          ? 'grid-cols-[160px_60px_1fr_100px]'
          : 'grid-cols-[60px_1fr_100px]'
      } ${!ultimo ? 'border-b border-bone-border' : ''}`}
    >
      {mostrarFecha && (
        <span className="capitalize text-xs text-ink-2">
          {formatFecha(cita.fechaHora)}
        </span>
      )}
      <span className="font-mono text-[13px] text-ink-1 tabular">
        {formatHora(cita.fechaHora)}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[13px] text-ink-1 truncate">
          {cita.paciente?.nombre ?? '—'}
        </span>
        <i className="ti ti-arrow-right text-ink-2 text-base flex-shrink-0" />
        <span className="text-[13px] text-ink-2 truncate">
          {cita.profesional?.nombre ?? '—'}
        </span>
      </div>
      <div className="flex justify-end">
        <Badge estado={cita.estado}>{cita.estado.toLowerCase()}</Badge>
      </div>
    </li>
  )
}

function EmptyState({ icon, message }) {
  return (
    <Card>
      <div className="flex items-center gap-3 text-ink-2 text-sm">
        <i className={`ti ${icon} text-xl text-bone-muted`} />
        <span>{message}</span>
      </div>
    </Card>
  )
}