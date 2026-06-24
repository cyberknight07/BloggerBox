import { createContext, useContext, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bh_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // data = { user, accessToken, refreshToken } from login/register response
  const login = (data) => {
    localStorage.setItem('bh_user', JSON.stringify(data.user))
    localStorage.setItem('bh_access', data.accessToken)
    localStorage.setItem('bh_refresh', data.refreshToken)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('bh_refresh')
      if (refreshToken) await authApi.logout({ refreshToken })
    } catch {
      // ignore — clear local state regardless
    }
    localStorage.removeItem('bh_user')
    localStorage.removeItem('bh_access')
    localStorage.removeItem('bh_refresh')
    setUser(null)
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('bh_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
