import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { CitasPage } from './pages/CitasPage'
import { AgendarPage } from './pages/AgendarPage'
import { MiAgendaPage } from './pages/MiAgendaPage'
import { AdminCitasPage } from './pages/AdminCitasPage'
import { AdminNuevaCitaPage } from './pages/AdminNuevaCitaPage'
import { AdminAgendaPage } from './pages/AdminAgendaPage'
import { AdminUsuariosPage } from './pages/AdminUsuariosPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { NuevoUsuarioPage } from './pages/NuevoUsuarioPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />

            {/* Pacientes y profesionales */}
            <Route
              path="/citas"
              element={
                <ProtectedRoute roles={['PACIENTE', 'PROFESIONAL']}>
                  <CitasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/nuevo"
              element={
                <ProtectedRoute roles={['ADMIN', 'PROFESIONAL']}>
                  <NuevoUsuarioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendar"
              element={
                <ProtectedRoute roles={['PACIENTE']}>
                  <AgendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-agenda"
              element={
                <ProtectedRoute roles={['PROFESIONAL']}>
                  <MiAgendaPage />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/citas"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminCitasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/citas/nueva"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminNuevaCitaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agenda"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminAgendaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminUsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App