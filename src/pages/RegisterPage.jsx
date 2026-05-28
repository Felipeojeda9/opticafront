import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'PACIENTE',
    rut: '',
    fechaNacimiento: '',
    especialidad: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
      } else if (form.rol === 'PROFESIONAL') {
        payload.especialidad = form.especialidad
      }

      await register(payload)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bone-bg px-6 py-10">
      <div className="max-w-md mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-full bg-zeus-500 text-white flex items-center justify-center font-medium text-base">
            Z
          </div>
          <div className="leading-tight">
            <div className="font-medium text-base tracking-wider text-ink-0">ZEUS</div>
            <div className="text-[10px] text-ink-2 tracking-[2px]">ÓPTICA</div>
          </div>
        </Link>

        <div className="eyebrow mb-2">Crear cuenta</div>
        <h1 className="font-serif text-3xl text-ink-0 mb-2 leading-tight">
          Únete a Zeus
        </h1>
        <p className="text-sm text-ink-2 mb-8">
          Completa tus datos para acceder al sistema.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-white border border-bone-border rounded-md">
          <RolToggle
            value="PACIENTE"
            label="Soy paciente"
            icon="ti-user"
            activo={form.rol === 'PACIENTE'}
            onClick={() => setForm({ ...form, rol: 'PACIENTE' })}
          />
          <RolToggle
            value="PROFESIONAL"
            label="Soy profesional"
            icon="ti-stethoscope"
            activo={form.rol === 'PROFESIONAL'}
            onClick={() => setForm({ ...form, rol: 'PROFESIONAL' })}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            required
            autoComplete="name"
            placeholder="Felipe Aravena"
            value={form.nombre}
            onChange={update('nombre')}
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
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.cl"
            value={form.email}
            onChange={update('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={update('password')}
          />

          {form.rol === 'PACIENTE' && (
            <Input
              label="Fecha de nacimiento"
              type="date"
              required
              value={form.fechaNacimiento}
              onChange={update('fechaNacimiento')}
            />
          )}

          {form.rol === 'PROFESIONAL' && (
            <Input
              label="Especialidad"
              required
              placeholder="Ej: Optometría, Oftalmología"
              value={form.especialidad}
              onChange={update('especialidad')}
            />
          )}

          {error && (
            <div className="flex items-start gap-2 px-3 py-2 bg-zeus-50 border border-zeus-200 rounded-md">
              <i className="ti ti-alert-circle text-zeus-500 text-base mt-0.5" />
              <p className="text-[12px] text-zeus-700 leading-snug">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={loading}
            iconRight="ti-arrow-right"
          >
            {loading ? 'Creando cuenta' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="text-sm text-ink-2 mt-8 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-zeus-500 hover:text-zeus-700 font-medium">
            Inicia sesión
          </Link>
        </p>

        <p className="text-[11px] text-bone-muted text-center mt-6 leading-relaxed">
          Al crear una cuenta aceptas el tratamiento responsable de tus datos según
          la normativa chilena de salud visual.
        </p>
      </div>
    </div>
  )
}

function RolToggle({ label, icon, activo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded text-[13px] font-medium transition-colors ${
        activo
          ? 'bg-zeus-500 text-white shadow-zeus-sm'
          : 'text-ink-2 hover:text-ink-1'
      }`}
    >
      <i className={`ti ${icon} text-base`} />
      <span>{label}</span>
    </button>
  )
}