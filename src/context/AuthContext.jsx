import { createContext, useContext, useEffect, useState } from 'react'
import { api, tokenStorage } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarUsuario = async () => {
      if (!tokenStorage.get()) {
        setLoading(false)
        return
      }
      try {
        const me = await api.get('/auth/me')
        setUser(me)
      } catch {
        tokenStorage.clear()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    cargarUsuario()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password }, { auth: false })
    tokenStorage.set(res.acces_token)
    const me = await api.get('/auth/me')
    setUser(me)
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload, { auth: false })
    tokenStorage.set(res.acces_token)
    const me = await api.get('/auth/me')
    setUser(me)
  }

  const logout = () => {
    tokenStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}