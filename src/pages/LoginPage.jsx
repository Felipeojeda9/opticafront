import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const SLIDES = [
  {
    eyebrow: 'Óptica Zeus · Linares',
    titulo: 'Salud visual, regulada y trazable.',
    descripcion:
      'La única óptica de Linares con laboratorio de montaje propio, atención clínica especializada y entrega de lentes desde una hora.',
    stats: [
      { numero: '+18', label: 'Años de experiencia' },
      { numero: '+7', label: 'Años en Linares' },
      { numero: '+15K', label: 'Pacientes' },
    ],
  },
  {
    eyebrow: 'Visítanos',
    titulo: 'Dos sucursales en Linares.',
    descripcion:
      'Atención clínica, laboratorio de montaje y asesoría personalizada en ambas ubicaciones.',
    contactos: [
      {
        icon: 'ti-building-store',
        nombre: 'Casa Matriz',
        detalle: 'Independencia 464, Centro de Linares',
        telefono: '+56 9 3617 6438',
      },
      {
        icon: 'ti-building',
        nombre: 'Sucursal Maipú',
        detalle: 'Maipú 410-E, esq. Manuel Rodríguez',
        telefono: '+56 9 7923 2343',
      },
    ],
  },
  {
    eyebrow: 'Nuestro compromiso',
    titulo: 'Comprometidos con tu salud visual.',
    descripcion:
      'Combinamos experiencia clínica, tecnología y trato cercano para entregar soluciones confiables a personas y organizaciones.',
    redes: [
      { icon: 'ti-brand-facebook', label: 'Facebook', url: 'https://web.facebook.com/opticazeuscl?_rdc=1&_rdr' },
      { icon: 'ti-brand-instagram', label: 'Instagram', url: 'https://www.instagram.com/opticazeuscl/' },
      { icon: 'ti-brand-whatsapp', label: 'WhatsApp', url: 'https://wa.me/56936176438' },
    ],
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slideActivo, setSlideActivo] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSlideActivo((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(id)
  }, [])

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

  const slide = SLIDES[slideActivo]

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex items-center justify-center px-6 py-12 bg-bone-bg">
        <div className="w-full max-w-sm">
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
        </div>
      </div>

      <div className="hidden lg:flex relative bg-zeus-500 text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative">
          <div
            key={`eyebrow-${slideActivo}`}
            className="text-[11px] uppercase tracking-[2px] opacity-75 animate-fade-in"
          >
            {slide.eyebrow}
          </div>
        </div>

        <div className="relative max-w-md" key={`content-${slideActivo}`}>
          <div className="animate-fade-in">
            <div className="font-serif text-4xl leading-tight mb-4">
              {slide.titulo}
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              {slide.descripcion}
            </p>

            {slide.stats && (
              <div className="grid grid-cols-3 gap-4 text-white/90 mt-8">
                {slide.stats.map((s, i) => (
                  <div key={i}>
                    <div className="font-serif text-3xl leading-none">{s.numero}</div>
                    <div className="text-[11px] text-white/70 mt-1 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {slide.contactos && (
              <div className="space-y-4 mt-6">
                {slide.contactos.map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <i className={`ti ${c.icon} text-lg`} />
                    </div>
                    <div className="leading-tight">
                      <div className="text-[13px] font-medium">{c.nombre}</div>
                      <div className="text-[12px] text-white/75 mt-0.5">{c.detalle}</div>
                      <div className="text-[12px] text-white/90 font-mono mt-1">{c.telefono}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          {slide.redes && (
              <div className="flex gap-3 mt-6">
                {slide.redes.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    title={r.label}
                    aria-label={r.label}
                  >
                    <i className={`ti ${r.icon} text-xl`} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideActivo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slideActivo ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="text-[11px] text-white/50 font-mono tabular">
            {String(slideActivo + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}