import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MENU_POR_ROL = {
  ADMIN: {
    label: 'Admin',
    items: [
      { to: '/admin',          icon: 'ti-layout-dashboard', label: 'Panel' },
      { to: '/admin/citas',    icon: 'ti-calendar-event',   label: 'Citas' },
      { to: '/admin/agenda',   icon: 'ti-calendar-time',    label: 'Agenda' },
      { to: '/admin/usuarios', icon: 'ti-users',            label: 'Usuarios' },
    ],
    actions: [
      { to: '/admin/citas/nueva', icon: 'ti-plus',      label: 'Nueva cita' },
      { to: '/usuarios/nuevo',    icon: 'ti-user-plus', label: 'Nuevo usuario' },
    ],
  },
  PROFESIONAL: {
    label: 'Profesional',
    items: [
      { to: '/citas',     icon: 'ti-calendar-event', label: 'Mis citas' },
      { to: '/mi-agenda', icon: 'ti-calendar-time',  label: 'Mi agenda' },
    ],
    actions: [
      { to: '/usuarios/nuevo', icon: 'ti-user-plus', label: 'Nuevo paciente' },
    ],
  },
  PACIENTE: {
    label: 'Paciente',
    items: [
      { to: '/citas',    icon: 'ti-calendar-event', label: 'Mis citas' },
      { to: '/agendar',  icon: 'ti-calendar-plus',  label: 'Agendar hora' },
    ],
    actions: [],
  },
}

const FONDO_POR_ROL = {
  ADMIN:       'bg-zeus-700',
  PROFESIONAL: 'bg-zeus-600',
  PACIENTE:    'bg-zeus-500',
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-5 py-2.5 text-[13px] border-l-[3px] transition-colors ${
          isActive
            ? 'bg-white/10 border-white text-white'
            : 'border-transparent text-white/80 hover:text-white hover:bg-white/5'
        }`
      }
    >
      <i className={`ti ${icon} text-base`} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const rol = user?.rol || 'PACIENTE'
  const menu = MENU_POR_ROL[rol] || MENU_POR_ROL.PACIENTE
  const fondo = FONDO_POR_ROL[rol] || FONDO_POR_ROL.PACIENTE

  const nombre = user?.nombre || 'Usuario'
  const iniciales = nombre
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`${fondo} text-white w-sidebar flex flex-col fixed left-0 top-0 bottom-0 z-10`}
    >
      <div className="px-5 pt-5 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white text-zeus-700 flex items-center justify-center font-medium text-sm">
            Z
          </div>
          <div className="leading-tight">
            <div className="font-medium text-sm tracking-wider">ZEUS</div>
            <div className="text-[10px] opacity-65 tracking-[2px]">ÓPTICA</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-[1.5px] opacity-55 px-5 pb-2">
          {menu.label}
        </div>
        {menu.items.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        {menu.actions.length > 0 && (
          <>
            <div className="text-[10px] uppercase tracking-[1.5px] opacity-55 px-5 pt-5 pb-2">
              Acciones
            </div>
            {menu.actions.map(item => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-full bg-white/15 flex items-center justify-center text-xs font-medium">
          {iniciales}
        </div>
        <div className="leading-tight flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{nombre}</div>
          <div className="text-[10px] opacity-60 uppercase tracking-wider">
            {rol.toLowerCase()}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar sesión"
        >
          <i className="ti ti-logout text-base" />
        </button>
      </div>
    </aside>
  )
}