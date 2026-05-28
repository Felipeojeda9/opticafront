import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">

      {/* Columna izquierda · formulario */}
      <div className="flex items-center justify-center px-6 py-12 bg-bone-bg">
        <div className="w-full max-w-sm">
          {/* Marca */}
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-full bg-zeus-500 text-white flex items-center justify-center font-medium text-base">
              Z
            </div>
            <div className="leading-tight">
              <div className="font-medium text-base tracking-wider text-ink-0">ZEUS</div>
              <div className="text-[10px] text-ink-2 tracking-[2px]">ÓPTICA</div>
            </div>
          </Link>

          <div className="eyebrow mb-2">Bienvenido de vuelta</div>
          <h1 className="font-serif text-3xl text-ink-0 mb-2 leading-tight">
            Inicia sesión
          </h1>
          <p className="text-sm text-ink-2 mb-8">
            Ingresa con tu correo para acceder a tu cuenta.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="tu@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Contraseña"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

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
              {loading ? 'Entrando' : 'Entrar'}
            </Button>
          </form>

          <p className="text-sm text-ink-2 mt-8 text-center">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-zeus-500 hover:text-zeus-700 font-medium">
              Crear una
            </Link>
          </p>
        </div>
      </div>

      {/* Columna derecha · panel de marca */}
      <div className="hidden lg:flex relative bg-zeus-500 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Patrón decorativo sutil */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative">
          <div className="text-[11px] uppercase tracking-[2px] opacity-75 mb-3">
            Óptica Zeus · Linares
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="font-serif text-4xl leading-tight mb-4">
            Salud visual, regulada y trazable.
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            La única óptica de Linares con laboratorio de montaje propio,
            atención clínica especializada y entrega de lentes desde una hora.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4 text-white/90">
          <Stat numero="+18" label="Años de experiencia" />
          <Stat numero="+7" label="Años en Linares" />
          <Stat numero="+15K" label="Pacientes" />
        </div>
      </div>
    </div>
  )
}

function Stat({ numero, label }) {
  return (
    <div>
      <div className="font-serif text-3xl leading-none">{numero}</div>
      <div className="text-[11px] text-white/70 mt-1 leading-tight">{label}</div>
    </div>
  )
}