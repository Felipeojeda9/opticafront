import { useEffect, useState, useCallback, useMemo } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { PromptDialog } from '../components/ui/PromptDialog'

function hoy() {
  return new Date().toISOString().split('T')[0]
}

function horaDe(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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

export function MiAgendaPage() {
  const { user } = useAuth()
  const [profesionalId, setProfesionalId] = useState(null)
  const [profesional, setProfesional] = useState(null)
  const [fecha, setFecha] = useState(hoy())
  const [slots, setSlots] = useState([])
  const [citasDelDia, setCitasDelDia] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPerfil, setLoadingPerfil] = useState(true)
  const [error, setError] = useState('')

  const [bloqueandoSlot, setBloqueandoSlot] = useState(null)
  const [desbloqueando, setDesbloqueando] = useState(null)
  const [bloqueandoDia, setBloqueandoDia] = useState(false)
  const [accionEnCurso, setAccionEnCurso] = useState(false)

  // Paso 1: encontrar mi perfil de profesional
  useEffect(() => {
    api.get('/users/profesionales')
      .then((lista) => {
        const yo = lista.find((p) => p.usuarioId === user.id)
        if (!yo) {
          setError('No encontramos tu perfil de profesional.')
          return
        }
        setProfesional(yo)
        setProfesionalId(yo.id)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingPerfil(false))
  }, [user.id])

  // Paso 2: slots + citas del día
  const cargar = useCallback(async () => {
    if (!profesionalId) return
    setLoading(true)
    setError('')
    try {
      const [slotsData, todasCitas] = await Promise.all([
        api.get(`/citas/disponibles?fecha=${fecha}&profesionalId=${profesionalId}`),
        api.get('/citas'),
      ])
      setSlots(slotsData)
      const delDia = todasCitas.filter((c) => {
        const fechaCita = c.fechaHora.split('T')[0]
        return fechaCita === fecha && c.estado !== 'CANCELADA'
      })
      setCitasDelDia(delDia)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fecha, profesionalId])

  useEffect(() => { cargar() }, [cargar])

  // === Acciones · sin profesionalId, el backend lo infiere ===
  const confirmarBloquearSlot = async (motivo) => {
    if (!bloqueandoSlot) return
    setAccionEnCurso(true)
    try {
      await api.post('/citas/bloquear-slot', {
        fechaHora: `${fecha}T${bloqueandoSlot.hora}:00`,
        motivo: motivo || undefined,
      })
      setBloqueandoSlot(null)
      await cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setAccionEnCurso(false)
    }
  }

  const confirmarDesbloquear = async () => {
    if (!desbloqueando) return
    setAccionEnCurso(true)
    try {
      await api.delete(`/citas/dias-bloqueados/${desbloqueando.bloqueoId}`)
      setDesbloqueando(null)
      await cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setAccionEnCurso(false)
    }
  }

  const confirmarBloquearDia = async (motivo) => {
    setAccionEnCurso(true)
    try {
      await api.post('/citas/bloquear-dia', {
        fecha,
        motivo: motivo || undefined,
      })
      setBloqueandoDia(false)
      await cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setAccionEnCurso(false)
    }
  }

  const citasPorHora = useMemo(
    () => Object.fromEntries(citasDelDia.map((c) => [horaDe(c.fechaHora), c])),
    [citasDelDia]
  )

  const stats = useMemo(() => {
    let libres = 0, ocupados = 0, bloqueados = 0
    for (const s of slots) {
      if (citasPorHora[s.hora]) ocupados++
      else if (s.bloqueado) bloqueados++
      else if (s.disponible) libres++
    }
    return { libres, ocupados, bloqueados }
  }, [slots, citasPorHora])

  const slotsManana = slots.filter((s) => esManana(s.hora))
  const slotsTarde = slots.filter((s) => !esManana(s.hora))

  if (loadingPerfil) {
    return <div className="px-10 py-8 text-ink-2 text-sm">Cargando tu agenda…</div>
  }

  if (error && !profesionalId) {
    return (
      <div className="px-10 py-8 max-w-5xl">
        <Card>
          <div className="flex items-start gap-3">
            <i className="ti ti-alert-circle text-zeus-500 text-xl mt-0.5" />
            <div>
              <h2 className="text-base font-medium text-ink-0 mb-1">
                No pudimos cargar tu agenda
              </h2>
              <p className="text-sm text-ink-2">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-10 py-8 max-w-5xl">
      <PageHeader
        eyebrow="Mi agenda"
        title={formatFechaLarga(fecha)}
        subtitle={profesional ? `${profesional.especialidad}` : ''}
        actions={
          <Button
            icon="ti-ban"
            onClick={() => setBloqueandoDia(true)}
            disabled={stats.libres === 0}
          >
            Bloquear día
          </Button>
        }
      />

      {error && profesionalId && (
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

      {/* Selector de fecha */}
      <Card padding="sm" className="mb-5">
        <div className="flex items-end gap-3 flex-wrap">
          <Input
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="max-w-[200px]"
          />
          <div className="flex gap-1 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFecha(hoy())}
            >
              Hoy
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon="ti-chevron-left"
              onClick={() => {
                const d = new Date(`${fecha}T12:00:00`)
                d.setDate(d.getDate() - 1)
                setFecha(d.toISOString().split('T')[0])
              }}
            >
              <span className="sr-only">Día anterior</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconRight="ti-chevron-right"
              onClick={() => {
                const d = new Date(`${fecha}T12:00:00`)
                d.setDate(d.getDate() + 1)
                setFecha(d.toISOString().split('T')[0])
              }}
            >
              <span className="sr-only">Día siguiente</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Resumen + leyenda */}
      {!loading && slots.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-sm text-ink-1">
            <span className="font-medium">{stats.ocupados}</span>
            <span className="text-ink-2"> citas · </span>
            <span className="font-medium">{stats.bloqueados}</span>
            <span className="text-ink-2"> bloqueados · </span>
            <span className="font-medium">{stats.libres}</span>
            <span className="text-ink-2"> libres</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-ink-2">
            <LegendDot color="bg-white border border-bone-border" label="Libre" />
            <LegendDot color="bg-state-info-bg border-l-[3px] border-state-info-line" label="Cita" />
            <LegendDot color="bg-zeus-100 border-l-[3px] border-zeus-500" label="Bloqueado" />
          </div>
        </div>
      )}

      {loading && (
        <Card>
          <p className="text-sm text-ink-2">Cargando agenda…</p>
        </Card>
      )}

      {!loading && slots.length === 0 && !error && (
        <Card>
          <div className="flex items-center gap-3 text-ink-2 text-sm py-2">
            <i className="ti ti-calendar-off text-xl text-bone-muted" />
            <span>No hay horarios configurados para esta fecha.</span>
          </div>
        </Card>
      )}

      {!loading && slots.length > 0 && (
        <Card padding="none">
          <BloqueHorario
            titulo="Mañana"
            slots={slotsManana}
            citasPorHora={citasPorHora}
            onBloquear={(hora) => setBloqueandoSlot({ hora })}
            onDesbloquear={(hora, bloqueoId) => setDesbloqueando({ hora, bloqueoId })}
          />
          {slotsTarde.length > 0 && (
            <BloqueHorario
              titulo="Tarde"
              slots={slotsTarde}
              citasPorHora={citasPorHora}
              onBloquear={(hora) => setBloqueandoSlot({ hora })}
              onDesbloquear={(hora, bloqueoId) => setDesbloqueando({ hora, bloqueoId })}
              conBorderTop
            />
          )}
        </Card>
      )}

      {/* Diálogos */}
      <PromptDialog
        open={!!bloqueandoSlot}
        title={`Bloquear ${bloqueandoSlot?.hora} hrs`}
        description="El horario quedará no disponible para que los pacientes agenden."
        label="Motivo (opcional)"
        placeholder="Ej: reunión clínica, almuerzo extendido…"
        hint="Solo lo verá el equipo, no los pacientes."
        confirmLabel="Bloquear"
        loading={accionEnCurso}
        onConfirm={confirmarBloquearSlot}
        onCancel={() => !accionEnCurso && setBloqueandoSlot(null)}
      />

      <ConfirmDialog
        open={!!desbloqueando}
        title={`¿Desbloquear ${desbloqueando?.hora} hrs?`}
        description="El horario volverá a estar disponible para agendar."
        confirmLabel="Sí, desbloquear"
        cancelLabel="Volver"
        variant="primary"
        loading={accionEnCurso}
        onConfirm={confirmarDesbloquear}
        onCancel={() => !accionEnCurso && setDesbloqueando(null)}
      />

      <PromptDialog
        open={bloqueandoDia}
        title="Bloquear día completo"
        description={`Se bloquearán los ${stats.libres} slots libres del ${formatFechaLarga(fecha)}. Tus citas existentes no se cancelan.`}
        label="Motivo (opcional)"
        placeholder="Ej: día libre, vacaciones, capacitación…"
        confirmLabel="Bloquear día"
        loading={accionEnCurso}
        onConfirm={confirmarBloquearDia}
        onCancel={() => !accionEnCurso && setBloqueandoDia(false)}
      />
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}

function BloqueHorario({ titulo, slots, citasPorHora, onBloquear, onDesbloquear, conBorderTop }) {
  return (
    <div className={conBorderTop ? 'border-t border-bone-border' : ''}>
      <div className="px-4 py-2 bg-bone-surface text-[11px] uppercase tracking-[0.5px] font-medium text-ink-2">
        {titulo}
      </div>
      {slots.map((s, i) => {
        const ultimo = i === slots.length - 1
        const cita = citasPorHora[s.hora]
        return (
          <SlotRow
            key={s.hora}
            slot={s}
            cita={cita}
            ultimo={ultimo}
            onBloquear={() => onBloquear(s.hora)}
            onDesbloquear={() => onDesbloquear(s.hora, s.bloqueoId)}
          />
        )
      })}
    </div>
  )
}

function SlotRow({ slot, cita, ultimo, onBloquear, onDesbloquear }) {
  const border = !ultimo ? 'border-b border-bone-border' : ''

  if (cita) {
    return (
      <div
        className={`grid grid-cols-[70px_1fr_auto] items-center px-4 py-2.5 bg-state-info-bg border-l-[3px] border-state-info-line ${border}`}
      >
        <span className="font-mono text-[13px] text-state-info-text tabular font-medium">
          {slot.hora}
        </span>
        <div>
          <div className="text-[13px] text-state-info-text font-medium">
            {cita.paciente?.nombre ?? 'Paciente'}
          </div>
          <div className="text-[11px] text-state-info-text/75 capitalize">
            {cita.estado.toLowerCase()}
          </div>
        </div>
        <i className="ti ti-eye text-base text-state-info-text/60" />
      </div>
    )
  }

  if (slot.bloqueado) {
    return (
      <button
        onClick={onDesbloquear}
        className={`w-full grid grid-cols-[70px_1fr_auto] items-center px-4 py-2.5 bg-zeus-50 border-l-[3px] border-zeus-500 hover:bg-zeus-100 transition-colors text-left ${border}`}
        title="Click para desbloquear"
      >
        <span className="font-mono text-[13px] text-zeus-700 tabular font-medium">
          {slot.hora}
        </span>
        <div>
          <div className="text-[13px] text-zeus-700 font-medium">Bloqueado</div>
          {slot.motivo && (
            <div className="text-[11px] text-zeus-700/75 truncate">{slot.motivo}</div>
          )}
        </div>
        <i className="ti ti-lock text-base text-zeus-600" />
      </button>
    )
  }

  if (slot.disponible) {
    return (
      <button
        onClick={onBloquear}
        className={`w-full grid grid-cols-[70px_1fr_auto] items-center px-4 py-2.5 hover:bg-bone-surface transition-colors text-left group ${border}`}
        title="Click para bloquear"
      >
        <span className="font-mono text-[13px] text-ink-1 tabular font-medium">
          {slot.hora}
        </span>
        <span className="text-[12px] text-bone-muted">Disponible</span>
        <i className="ti ti-ban text-base text-bone-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }

  return (
    <div
      className={`grid grid-cols-[70px_1fr_auto] items-center px-4 py-2.5 ${border}`}
    >
      <span className="font-mono text-[13px] text-bone-muted tabular">
        {slot.hora}
      </span>
      <span className="text-[12px] text-bone-muted">—</span>
      <span />
    </div>
  )
}