import { createContext, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../lib/api'

const AuthContext = createContext(null)
const USER_KEY = 'kynd.auth.user.v1'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
      else localStorage.removeItem(USER_KEY)
    } catch {}
  }, [user])

  // Keep auth state in sync across browser tabs/windows of the same origin.
  // Without this, a tab that logged in earlier keeps a stale in-memory session
  // (e.g. an admin shell) even after another tab logs out or logs in as a
  // different user.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== USER_KEY) return
      try {
        setUser(e.newValue ? JSON.parse(e.newValue) : null)
      } catch {
        setUser(null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const signup = async ({ name, email, password }) => {
    const normalizedEmail = String(email).trim().toLowerCase()
    if (!name || !normalizedEmail || !password) throw new Error('All fields are required.')
    if (password.length < 6) throw new Error('Password must be at least 6 characters.')

    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: normalizedEmail, password })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to create account.')

    const session = { name: data.name, email: data.email, id: data.id, role: data.role }
    setUser(session)
    return session
  }

  const login = async ({ email, password }) => {
    const normalizedEmail = String(email).trim().toLowerCase()
    if (!normalizedEmail || !password) throw new Error('Email and password are required.')

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to sign in.')

    const session = { name: data.name, email: data.email, id: data.id, role: data.role, token: data.token }
    setUser(session)
    return session
  }

  const logout = () => setUser(null)

  const requestPasswordReset = async ({ email }) => {
    const normalizedEmail = String(email).trim().toLowerCase()
    if (!normalizedEmail) throw new Error('Email is required.')

    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to process request.')

    return data
  }

  const resetPassword = async ({ token, password }) => {
    if (!token || !password) throw new Error('Token and password are required.')
    if (password.length < 6) throw new Error('Password must be at least 6 characters.')

    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to reset password.')

    return data
  }

  const isAdmin = !!user && (user.role === 'admin' || user.role === 'super_admin')

  return (
    <AuthContext.Provider value={{ user, token: user?.token || null, isAuthenticated: !!user, isAdmin, signup, login, logout, requestPasswordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
