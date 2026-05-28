import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const enAdmin = location.pathname.startsWith('/admin')

  return (
    <header className="border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-medium">Óptica Zeus</Link>

        <nav className="flex items-center gap-6 text-sm">
          {user.rol !== 'ADMIN' && (
            <Link to="/citas" className="hover:underline">Mis citas</Link>
          )}

          {user.rol === 'PACIENTE' && (
            <Link to="/agendar" className="hover:underline">Agendar</Link>
          )}

         {user.rol === 'PROFESIONAL' && (
            <>
              <Link to="/mi-agenda" className="hover:underline">Mi agenda</Link>
              <Link to="/usuarios/nuevo" className="hover:underline">Nuevo paciente</Link>
            </>
          )}
          {user.rol === 'ADMIN' && (
            <Link to="/admin" className="hover:underline">Admin</Link>
          )}

          <span className="text-neutral-500">{user.nombre} ({user.rol})</span>
          <button onClick={handleLogout} className="underline">Salir</button>
        </nav>
      </div>

      {/* Sub-navegación admin */}
      {user.rol === 'ADMIN' && enAdmin && (
        <div className="border-t border-neutral-100 bg-neutral-50">
          <div className="max-w-5xl mx-auto px-6 py-2 flex gap-1 text-sm">
            <SubLink to="/admin">Panel</SubLink>
            <SubLink to="/admin/citas">Citas</SubLink>
            <SubLink to="/admin/agenda">Agenda</SubLink>
            <SubLink to="/admin/usuarios">Usuarios</SubLink>
          </div>
        </div>
      )}
    </header>
  )
}

function SubLink({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-3 py-1.5 ${isActive ? 'bg-black text-white' : 'hover:bg-neutral-200'}`
      }
    >
      {children}
    </NavLink>
  )
}