import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Tabs } from '../components/ui/Tabs'

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function calcularEdad(iso) {
  if (!iso) return null
  const nacimiento = new Date(iso)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const m = hoy.getMonth() - nacimiento.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

function normalizar(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function AdminUsuariosPage() {
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('pacientes')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/users/pacientes'),
      api.get('/users/profesionales'),
    ])
      .then(([pac, prof]) => {
        setPacientes(pac)
        setProfesionales(prof)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const q = normalizar(busqueda)

  const pacientesFiltrados = useMemo(() => {
    if (!q) return pacientes
    return pacientes.filter((p) =>
      [p.nombre, p.rut, p.email, p.telefono].some((campo) =>
        normalizar(campo).includes(q)
      )
    )
  }, [pacientes, q])

  const profesionalesFiltrados = useMemo(() => {
    if (!q) return profesionales
    return profesionales.filter((p) =>
      [p.nombre, p.rut, p.especialidad].some((campo) =>
        normalizar(campo).includes(q)
      )
    )
  }, [profesionales, q])

  const cambiarTab = (nuevo) => {
    setTab(nuevo)
    setBusqueda('')
  }

  if (loading) {
    return <div className="px-10 py-8 text-ink-2 text-sm">Cargando usuarios…</div>
  }

  if (error) {
    return (
      <div className="px-10 py-8">
        <Card>
          <div className="flex items-start gap-3">
            <i className="ti ti-alert-circle text-zeus-500 text-xl mt-0.5" />
            <div>
              <h2 className="text-base font-medium text-ink-0 mb-1">
                No pudimos cargar los usuarios
              </h2>
              <p className="text-sm text-ink-2">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const lista = tab === 'pacientes' ? pacientesFiltrados : profesionalesFiltrados
  const totalActual = tab === 'pacientes' ? pacientes.length : profesionales.length

  return (
    <div className="px-10 py-8 max-w-6xl">
      <PageHeader
        eyebrow="Gestión"
        title="Usuarios"
        subtitle={`${pacientes.length} pacientes · ${profesionales.length} profesionales`}
        actions={
          <Link to="/usuarios/nuevo">
            <Button icon="ti-plus">Nuevo usuario</Button>
          </Link>
        }
      />

      <Tabs
        tabs={[
          { value: 'pacientes', label: 'Pacientes', count: pacientes.length },
          { value: 'profesionales', label: 'Profesionales', count: profesionales.length },
        ]}
        activo={tab}
        onChange={cambiarTab}
        className="mb-5"
      />

      <div className="flex items-center gap-3 mb-5">
        <Input
          icon="ti-search"
          placeholder={
            tab === 'pacientes'
              ? 'Buscar por nombre, RUT, email o teléfono...'
              : 'Buscar por nombre, RUT o especialidad...'
          }
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-md flex-1"
        />
        {busqueda && (
          <div className="text-xs text-ink-2">
            {lista.length} de {totalActual}
          </div>
        )}
      </div>
      
      {lista.length === 0 ? (
        <Card>
          <div className="flex items-center gap-3 text-ink-2 text-sm py-2">
            <i className="ti ti-search-off text-xl text-bone-muted" />
            <span>
              {busqueda
                ? `No encontramos ${tab} con "${busqueda}".`
                : `No hay ${tab} registrados.`}
            </span>
          </div>
        </Card>
      ) : tab === 'pacientes' ? (
        <TablaPacientes pacientes={lista} />
      ) : (
        <TablaProfesionales profesionales={lista} />
      )}
    </div>
  )
}

function TablaPacientes({ pacientes }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-bone-surface text-left text-[11px] uppercase tracking-[0.5px] font-medium text-ink-2">
            <th className="py-2.5 px-4">Nombre</th>
            <th className="py-2.5 px-4">RUT</th>
            <th className="py-2.5 px-4">Edad</th>
            <th className="py-2.5 px-4">Teléfono</th>
            <th className="py-2.5 px-4">Email</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p, i) => {
            const ultimo = i === pacientes.length - 1
            const edad = calcularEdad(p.fechaNacimiento)
            return (
              <tr
                key={p.id}
                className={`${!ultimo ? 'border-b border-bone-border' : ''} hover:bg-bone-bg transition-colors`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar nombre={p.nombre} />
                    <span className="text-ink-1">{p.nombre}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-ink-2 tabular">
                  {p.rut}
                </td>
                <td className="py-3 px-4 text-ink-2 tabular">
                  {edad !== null ? `${edad} años` : '—'}
                </td>
                <td className="py-3 px-4 text-ink-2 tabular">
                  {p.telefono ?? '—'}
                </td>
                <td className="py-3 px-4 text-ink-2">
                  {p.email ?? '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

function TablaProfesionales({ profesionales }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-bone-surface text-left text-[11px] uppercase tracking-[0.5px] font-medium text-ink-2">
            <th className="py-2.5 px-4">Nombre</th>
            <th className="py-2.5 px-4">RUT</th>
            <th className="py-2.5 px-4">Especialidad</th>
          </tr>
        </thead>
        <tbody>
          {profesionales.map((p, i) => {
            const ultimo = i === profesionales.length - 1
            return (
              <tr
                key={p.id}
                className={`${!ultimo ? 'border-b border-bone-border' : ''} hover:bg-bone-bg transition-colors`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar nombre={p.nombre} variant="profesional" />
                    <span className="text-ink-1">{p.nombre}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-ink-2 tabular">
                  {p.rut}
                </td>
                <td className="py-3 px-4 text-ink-1">
                  {p.especialidad}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

function Avatar({ nombre, variant = 'paciente' }) {
  const iniciales = (nombre || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const colores = {
    paciente:    'bg-zeus-100 text-zeus-700',
    profesional: 'bg-zeus-500 text-white',
  }

  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${colores[variant]}`}
    >
      {iniciales}
    </div>
  )
}