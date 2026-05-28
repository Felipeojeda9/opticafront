import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { crearUsuario } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'

const ROL_LABEL = {
  PACIENTE:    'Paciente',
  PROFESIONAL: 'Profesional',
  ADMIN:       'Administrador',
}

const ROL_ICON = {
  PACIENTE:    'ti-user',
  PROFESIONAL: 'ti-stethoscope',
  ADMIN:       'ti-shield-lock',
}

export function NuevoUsuarioPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const rolesDisponibles = user.rol === 'ADMIN'
    ? ['PACIENTE', 'PROFESIONAL', 'ADMIN']
    : ['PACIENTE']

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: rolesDisponibles[0],
    rut: '',
    fechaNacimiento: '',
    telefono: '',
    especialidad: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const payload = {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: form.rol,
        rut: form.rut,
      }
      if (form.rol === 'PACIENTE') {
        payload.fechaNacimiento = form.fechaNacimiento
        if (form.telefono.trim()) {
          payload.telefono = form.telefono.trim()
        }
      } else if (form.rol === 'PROFESIONAL') {
        payload.especialidad = form.especialidad
      }

      await crearUsuario(payload)
      setSuccess(`${ROL_LABEL[form.rol]} creado correctamente.`)
      setForm({
        nombre: '',
        email: '',
        password: '',
        rol: form.rol,
        rut: '',
        fechaNacimiento: '',
        telefono: '',
        especialidad: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const volverA = user.rol === 'ADMIN' ? '/admin/usuarios' : '/citas'

  return (
    <div className="px-10 py-8 max-w-3xl">
      <PageHeader
        eyebrow="Usuarios"
        title="Nuevo usuario"
        subtitle={
          user.rol === 'ADMIN'
            ? 'Crea cuentas para pacientes, profesionales o administradores'
            : 'Registra un nuevo paciente en el sistema'
        }
        actions={
          <Link to={volverA}>
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

      {success && (
        <Card className="mb-5 border-state-confirmed-line/30 bg-state-confirmed-bg">
          <div className="flex items-start gap-3">
            <i className="ti ti-circle-check text-state-confirmed-line text-xl mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-state-confirmed-text">{success}</p>
              <p className="text-[11px] text-state-confirmed-text/75 mt-0.5">
                El formulario quedó listo para crear otro usuario del mismo rol.
              </p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="text-state-confirmed-text hover:opacity-70"
              aria-label="Cerrar"
            >
              <i className="ti ti-x text-base" />
            </button>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        {rolesDisponibles.length > 1 && (
          <Card className="mb-5">
            <div className="eyebrow mb-3">Tipo de cuenta</div>
            <div className="grid grid-cols-3 gap-2">
              {rolesDisponibles.map((rol) => (
                <RolToggle
                  key={rol}
                  rol={rol}
                  activo={form.rol === rol}
                  onClick={() => setForm({ ...form, rol })}
                />
              ))}
            </div>
            <p className="text-[11px] text-ink-2 mt-3 leading-relaxed">
              {form.rol === 'PACIENTE' &&
                'Cuenta para agendar citas y ver historial propio.'}
              {form.rol === 'PROFESIONAL' &&
                'Cuenta con acceso a su agenda, citas asignadas y bloqueos de horario.'}
              {form.rol === 'ADMIN' &&
                'Cuenta con acceso completo: panel, usuarios, agenda de todos los profesionales.'}
            </p>
          </Card>
        )}

        <Card className="mb-5">
          <div className="eyebrow mb-4">Datos de la cuenta</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              required
              autoComplete="name"
              placeholder="Felipe Aravena"
              value={form.nombre}
              onChange={update('nombre')}
              className="md:col-span-2"
            />

            <Input
              label="Correo electrónico"
              type="email"
              required
              autoComplete="email"
              placeholder="persona@correo.cl"
              value={form.email}
              onChange={update('email')}
            />

            <Input
              label="RUT"
              required
              placeholder="12345678-9"
              hint="Sin puntos, con guión"
              value={form.rut}
              onChange={update('rut')}
            />

            <Input
              label="Contraseña inicial"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              hint="La persona podrá cambiarla después."
              value={form.password}
              onChange={update('password')}
              className="md:col-span-2"
            />
          </div>
        </Card>

        {form.rol === 'PACIENTE' && (
          <Card className="mb-5">
            <div className="eyebrow mb-4">Datos del paciente</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Fecha de nacimiento"
                type="date"
                required
                value={form.fechaNacimiento}
                onChange={update('fechaNacimiento')}
              />
              <Input
                label="Teléfono"
                type="tel"
                placeholder="+56 9 1234 5678"
                hint="Opcional, pero recomendado para recordatorios"
                value={form.telefono}
                onChange={update('telefono')}
              />
            </div>
          </Card>
        )}

        {form.rol === 'PROFESIONAL' && (
          <Card className="mb-5">
            <div className="eyebrow mb-4">Datos del profesional</div>
            <Input
              label="Especialidad"
              required
              placeholder="Ej: Optometría, Oftalmología"
              value={form.especialidad}
              onChange={update('especialidad')}
            />
          </Card>
        )}

        {form.rol === 'ADMIN' && (
          <Card className="mb-5 border-zeus-200 bg-zeus-50">
            <div className="flex items-start gap-3">
              <i className="ti ti-shield-lock text-zeus-500 text-xl mt-0.5" />
              <div>
                <p className="text-sm text-zeus-700 font-medium mb-1">
                  Estás creando un administrador
                </p>
                <p className="text-[12px] text-zeus-700/80 leading-relaxed">
                  Tendrá acceso completo al sistema: usuarios, citas, agenda y panel. Asegúrate de que sea una persona de confianza.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            size="lg"
            loading={loading}
            iconRight="ti-check"
          >
            {loading ? 'Creando' : 'Crear usuario'}
          </Button>
          <Link to={volverA}>
            <Button variant="ghost" size="lg">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

function RolToggle({ rol, activo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-md border-2 transition-colors ${
        activo
          ? 'border-zeus-500 bg-zeus-50'
          : 'border-bone-border bg-white hover:border-zeus-200'
      }`}
    >
      <i className={`ti ${ROL_ICON[rol]} text-xl ${
        activo ? 'text-zeus-500' : 'text-ink-2'
      }`} />
      <span className={`text-[13px] font-medium ${
        activo ? 'text-zeus-700' : 'text-ink-1'
      }`}>
        {ROL_LABEL[rol]}
      </span>
    </button>
  )
}