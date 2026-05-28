import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Select } from '../components/ui/Select'

function hoy() {
  return new Date().toISOString().split('T')[0]
}

function formatFechaLarga(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function esManana(hora) {
  return parseInt(hora.split(':')[0], 10) < 13
}

export function AgendarPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profesionales, setProfesionales] = useState([])
  const [profesionalId, setProfesionalId] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [slots, setSlots] = useState([])
  const [slotElegido, setSlotElegido] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingInicial, setLoadingInicial] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/users/profesionales')
      .then((data) => {
        setProfesionales(data)
        if (data[0]) setProfesionalId(String(data[0].id))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingInicial(false))
  }, [])

  useEffect(() => {
    if (!profesionalId || !fecha) return
    setLoadingSlots(true)
    setSlotElegido(null)
    api.get(`/citas/disponibles?fecha=${fecha}&profesionalId=${profesionalId}`)
      .then(setSlots)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSlots(false))
  }, [profesionalId, fecha])

  const handleAgendar = async () => {
    if (!slotElegido) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/citas', {
        fechaHora: `${fecha}T${slotElegido}:00`,
        profesionalId: Number(profesionalId),
      })
      navigate('/citas')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const profesional = useMemo(
    () => profesionales.find((p) => String(p.id) === profesionalId),
    [profesionales, profesionalId]
  )

  const slotsLibres = useMemo(() => slots.filter((s) => s.disponible), [slots])
  const slotsManana = slots.filter((s) => esManana(s.hora))
  const slotsTarde = slots.filter((s) => !esManana(s.hora))

  if (loadingInicial) {
    return <div className="min-h-screen flex items-center justify-center text-ink-2 text-sm">Cargando…</div>
  }

  return (
    <div className="min-h-screen bg-bone-bg">

      <header className="bg-white border-b border-bone-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zeus-500 text-white flex items-center justify-center font-medium text-sm">
              Z
            </div>
            <div className="leading-tight">
              <div className="font-medium text-sm tracking-wider text-ink-0">ZEUS</div>
              <div className="text-[10px] text-ink-2 tracking-[2px]">ÓPTICA</div>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="text-ink-2 hidden sm:inline">
              {user?.nombre}
            </span>
            <Link to="/citas">
              <Button variant="secondary" size="sm" icon="ti-calendar-event">
                Mis citas
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="text-center pt-12 pb-8 px-6">
        <div className="eyebrow mb-2">Reserva en línea</div>
        <h1 className="font-serif text-4xl text-ink-0 mb-3 leading-tight">
          Agenda tu hora
        </h1>
        <p className="text-sm text-ink-2 max-w-md mx-auto leading-relaxed">
          Tres pasos. Sin llamadas, sin esperas. La confirmación llega a tu correo.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 mb-10">
        <Stepper
          paso={!profesionalId ? 1 : !slotElegido ? 2 : 3}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">

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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          <Card>
            <div className="mb-6">
              <div className="eyebrow mb-2">Paso 1 · Servicio</div>
              <Select
                label="Profesional"
                value={profesionalId}
                onChange={(e) => setProfesionalId(e.target.value)}
              >
                {profesionales.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.especialidad}
                  </option>
                ))}
              </Select>
            </div>

            <div className="border-t border-bone-border pt-6 mb-6">
              <div className="eyebrow mb-2">Paso 2 · Fecha</div>
              <SelectorFecha fecha={fecha} setFecha={setFecha} />
            </div>

            <div className="border-t border-bone-border pt-6">
              <div className="eyebrow mb-2">Paso 3 · Horario</div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-ink-1 capitalize">
                  {formatFechaLarga(fecha)}
                </p>
                <span className="text-[11px] text-ink-2">
                  {loadingSlots
                    ? 'Cargando…'
                    : `${slotsLibres.length} disponibles`}
                </span>
              </div>

              {!loadingSlots && slots.length === 0 && (
                <div className="flex items-center gap-3 text-ink-2 text-sm py-2">
                  <i className="ti ti-calendar-off text-xl text-bone-muted" />
                  <span>No hay horarios para esta fecha.</span>
                </div>
              )}

              {!loadingSlots && slots.length > 0 && slotsLibres.length === 0 && (
                <div className="flex items-center gap-3 text-ink-2 text-sm py-2">
                  <i className="ti ti-mood-empty text-xl text-bone-muted" />
                  <span>Todos los horarios están tomados. Prueba otra fecha.</span>
                </div>
              )}

              {!loadingSlots && slotsLibres.length > 0 && (
                <div className="space-y-4">
                  {slotsManana.length > 0 && (
                    <BloqueSlots
                      titulo="Mañana"
                      slots={slotsManana}
                      slotElegido={slotElegido}
                      onElegir={setSlotElegido}
                    />
                  )}
                  {slotsTarde.length > 0 && (
                    <BloqueSlots
                      titulo="Tarde"
                      slots={slotsTarde}
                      slotElegido={slotElegido}
                      onElegir={setSlotElegido}
                    />
                  )}
                </div>
              )}
            </div>
          </Card>

          <aside className="space-y-3 lg:sticky lg:top-8 self-start">
            <Card>
              <div className="eyebrow mb-3">Tu reserva</div>

              <ResumenLinea label="Profesional">
                {profesional ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-7 h-7 rounded-full bg-zeus-500 text-white flex items-center justify-center text-[11px] font-medium flex-shrink-0">
                      {profesional.nombre.split(' ').map(p => p[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] text-ink-1 truncate">{profesional.nombre}</div>
                      <div className="text-[11px] text-ink-2">{profesional.especialidad}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-[12px] text-bone-muted">Sin seleccionar</span>
                )}
              </ResumenLinea>

              <ResumenLinea label="Fecha y hora" ultimo>
                {slotElegido ? (
                  <div className="bg-zeus-50 px-3 py-2 rounded-md border-l-[3px] border-zeus-500">
                    <div className="text-[13px] text-zeus-700 font-medium capitalize">
                      {formatFechaLarga(fecha)}
                    </div>
                    <div className="text-[13px] text-zeus-700 font-mono tabular">
                      {slotElegido} hrs
                    </div>
                  </div>
                ) : (
                  <span className="text-[12px] text-bone-muted">
                    Selecciona un horario
                  </span>
                )}
              </ResumenLinea>
            </Card>

            <Button
              className="w-full"
              size="lg"
              iconRight="ti-check"
              disabled={!slotElegido || !profesionalId}
              loading={submitting}
              onClick={handleAgendar}
            >
              {submitting ? 'Agendando' : 'Confirmar cita'}
            </Button>

            <div className="flex items-start gap-2 px-3 py-2 bg-bone-surface rounded-md">
              <i className="ti ti-info-circle text-base text-ink-2 mt-0.5" />
              <p className="text-[11px] text-ink-2 leading-relaxed">
                Puedes cancelar tu cita hasta 2 horas antes desde "Mis citas".
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Stepper({ paso }) {
  const pasos = [
    { n: 1, label: 'Servicio' },
    { n: 2, label: 'Fecha y hora' },
    { n: 3, label: 'Confirmar' },
  ]
  return (
    <div className="flex items-center justify-center gap-0">
      {pasos.map((p, i) => {
        const completado = paso > p.n
        const activo = paso === p.n
        return (
          <div key={p.n} className="flex items-center">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium tabular ${
                  activo || completado
                    ? 'bg-zeus-500 text-white'
                    : 'bg-white border border-bone-border text-bone-muted'
                }`}
              >
                {completado ? <i className="ti ti-check text-sm" /> : p.n}
              </div>
              <span className={`text-[12px] font-medium ${
                activo || completado ? 'text-ink-1' : 'text-bone-muted'
              }`}>
                {p.label}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <div className={`w-12 h-px mx-3 ${
                completado ? 'bg-zeus-500' : 'bg-bone-border'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SelectorFecha({ fecha, setFecha }) {
  const cambiar = (n) => {
    const d = new Date(`${fecha}T12:00:00`)
    d.setDate(d.getDate() + n)
    const min = new Date(`${hoy()}T12:00:00`)
    if (d < min) return
    setFecha(d.toISOString().split('T')[0])
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => cambiar(-1)}
        disabled={fecha === hoy()}
        className="w-9 h-9 rounded-md border border-bone-border bg-white flex items-center justify-center hover:border-zeus-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <i className="ti ti-chevron-left text-base text-ink-1" />
      </button>
      <input
        type="date"
        min={hoy()}
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="flex-1 h-9 px-3 text-[13px] text-ink-1 bg-white border border-bone-border rounded-md focus:outline-none focus:ring-2 focus:ring-zeus-200 focus:border-zeus-400"
      />
      <button
        onClick={() => cambiar(1)}
        className="w-9 h-9 rounded-md border border-bone-border bg-white flex items-center justify-center hover:border-zeus-300 transition-colors"
      >
        <i className="ti ti-chevron-right text-base text-ink-1" />
      </button>
    </div>
  )
}

function BloqueSlots({ titulo, slots, slotElegido, onElegir }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-ink-1 mb-2">{titulo}</div>
      <div className="grid grid-cols-4 md:grid-cols-5 gap-1.5">
        {slots.map((s) => {
          const ocupado = !s.disponible
          const elegido = slotElegido === s.hora

          const base =
            'h-9 px-1 rounded-md text-[12px] font-mono tabular font-medium transition-colors border'

          if (ocupado) {
            return (
              <button
                key={s.hora}
                type="button"
                disabled
                className={`${base} border-bone-border text-bone-muted line-through cursor-not-allowed`}
              >
                {s.hora}
              </button>
            )
          }

          if (elegido) {
            return (
              <button
                key={s.hora}
                type="button"
                onClick={() => onElegir(s.hora)}
                className={`${base} border-zeus-500 bg-zeus-500 text-white`}
              >
                {s.hora}
              </button>
            )
          }

          return (
            <button
              key={s.hora}
              type="button"
              onClick={() => onElegir(s.hora)}
              className={`${base} border-bone-border bg-white text-ink-1 hover:border-zeus-300 hover:bg-zeus-50`}
            >
              {s.hora}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ResumenLinea({ label, children, ultimo }) {
  return (
    <div className={`${!ultimo ? 'mb-3 pb-3 border-b border-bone-border' : ''}`}>
      <div className="text-[10px] text-ink-2 uppercase tracking-[1px] mb-1.5">
        {label}
      </div>
      {children}
    </div>
  )
}