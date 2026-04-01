import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { authApi, setAuthToken } from '@/api/client'

const AUTH_KEY = 'foodflow.auth'
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : { user: null, access: null, refresh: null }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    setAuthToken(session.access)
  }, [session])

  const authenticate = async (mode, payload) => {
    setLoading(true)
    try {
      const request = mode === 'login' ? authApi.login : authApi.register
      const { data } = await request(payload)
      setSession(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      user: session.user,
      access: session.access,
      refresh: session.refresh,
      isAuthenticated: Boolean(session.access),
      isAdmin: Boolean(session.user?.is_staff),
      loading,
      login: (payload) => authenticate('login', payload),
      register: (payload) => authenticate('register', payload),
      logout: () => setSession({ user: null, access: null, refresh: null }),
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return context
}
