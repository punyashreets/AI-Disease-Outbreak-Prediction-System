import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/auth/profile')
      setUser(res.data.user)
    } catch (err) {
      // Only logout if token is actually invalid (401/422), not on network errors
      if (err.response?.status === 401 || err.response?.status === 422) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, isAdmin = false) => {
    const res = await api.post('/api/auth/login', { email, password, isAdmin })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUser(userData)
    return userData
  }

  const register = async (data) => {
    const res = await api.post('/api/auth/register', data)
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
