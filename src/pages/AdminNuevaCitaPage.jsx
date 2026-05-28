import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'

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

export function AdminNuevaCitaPage() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [pacienteId, setPacienteId] = useState('')
  const [profesionalId, setProfesionalId] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [slots, setSlots] = useState([])
  const [slotElegido, setSlotElegido] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingInicial, setLoadingInicial] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/users/pacientes'),
      api.get('/users/profesionales'),
    ])
      .then(([pac, prof]) => {
        setPacientes(pac)
        setProfesionales(prof)
        if (pac[0]) setPacienteId(String(pac[0].id))
        if (prof[0]) setProfesionalId(String(prof[0].id))
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
    if (!slotElegido || !pacienteId) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/citas', {
        fechaHora: `${fecha}T${slotElegido}:00`,
        profesionalId: Number(profesionalId),
        pacienteId: Number(pacienteId),
      })
      navigate('/admin/citas')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const paciente = useMemo(
    () => pacientes.find((p) => String(p.id) === pacienteId),
    [pacientes, pacienteId]
  )
  const profesional = useMemo(
    () => profesionales.find((p) => String(p.id) === profesionalId),
    [profesionales, profesionalId]
  )

  const slotsLibres = useMemo(
    () => slots.filter((s) => s.disponible),
    [slots]
  )
  const slotsManana = slots.filter((s) => esManana(s.hora))
  const slotsTarde = slots.filter((s) => !esManana(s.hora))

  if (loadingInicial) {
    return <div className="px-10 py-8 text-ink-2 text-sm">Cargando formulario…</div>
  }

  return (
    <div className="px-10 py-8 max-w-6xl">
      <PageHeader
        eyebrow="Agendar"
        title="Nueva cita"
        subtitle="Asigna a un paciente con un profesional disponible"
        actions={
          <Link to="/admin/citas">
            <Button variant="secondary" icon="ti-arrow-left">
              Volver
            </Button>
          </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* Columna principal */}
        <div className="space-y-5">

          {/* 1 · Participantes */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <StepDot n={1} />
              <h2 className="text-base font-medium text-ink-0">Participantes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Paciente"
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
              >
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.rut}
                  </option>
                ))}
              </Select>
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
          </Card>

          {/* 2 · Fecha */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <StepDot n={2} />
              <h2 className="text-base font-medium text-ink-0">Fecha</h2>
            </div>
            <Input
              type="date"
              min={hoy()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              hint={`${formatFechaLarga(fecha)} · ${slotsLibres.length} horarios disponibles`}
              className="max-w-xs"
            />
          </Card>

          {/* 3 · Horario */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <StepDot n={3} />
              <h2 className="text-base font-medium text-ink-0">Horario</h2>
            </div>

            {loadingSlots && (
              <p className="text-sm text-ink-2">Cargando horarios…</p>
            )}

            {!loadingSlots && slots.length === 0 && (
              <div className="flex items-center gap-3 text-ink-2 text-sm">
                <i className="ti ti-calendar-off text-xl text-bone-muted" />
                <span>No hay horarios configurados para esta fecha.</span>
              </div>
            )}

            {!loadingSlots && slots.length > 0 && slotsLibres.length === 0 && (
              <div className="flex items-center gap-3 text-ink-2 text-sm">
                <i className="ti ti-mood-empty text-xl text-bone-muted" />
                <span>No quedan horarios libres este día. Probá otra fecha.</span>
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
          </Card>
        </div>

        {/* Resumen lateral */}
        <aside className="space-y-3 lg:sticky lg:top-8 self-start">
          <Card>
            <div className="eyebrow mb-3">Resumen</div>

            <ResumenLinea label="Paciente">
              {paciente ? (
                <>
                  <div className="text-[13px] text-ink-1">{paciente.nombre}</div>
                  <div className="text-[11px] text-ink-2 font-mono">{paciente.rut}</div>
                </>
              ) : (
                <span className="text-[12px] text-bone-muted">Sin seleccionar</span>
              )}
            </ResumenLinea>

            <ResumenLinea label="Profesional">
              {profesional ? (
                <>
                  <div className="text-[13px] text-ink-1">{profesional.nombre}</div>
                  <div className="text-[11px] text-ink-2">{profesional.especialidad}</div>
                </>
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
            disabled={!slotElegido || !pacienteId || !profesionalId}
            loading={submitting}
            onClick={handleAgendar}
          >
            {submitting ? 'Agendando' : 'Confirmar cita'}
          </Button>

          <div className="flex items-start gap-2 px-3 py-2 bg-bone-surface rounded-md">
            <i className="ti ti-info-circle text-base text-ink-2 mt-0.5" />
            <p className="text-[11px] text-ink-2 leading-relaxed">
              La cita queda en estado pendiente. El paciente recibirá confirmación por correo si tiene email registrado.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StepDot({ n }) {
  return (
    <div className="w-6 h-6 rounded-full bg-zeus-500 text-white flex items-center justify-center text-xs font-medium tabular flex-shrink-0">
      {n}
    </div>
  )
}

function BloqueSlots({ titulo, slots, slotElegido, onElegir }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-ink-1 mb-2">{titulo}</div>
      <div className="grid grid-cols-5 md:grid-cols-6 gap-1.5">
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