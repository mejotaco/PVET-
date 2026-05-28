import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as db from './db'

const USER_KEY = 'pvet_local_user'

interface AuthUser {
  id: number
  name: string
  email: string
  role: 'owner' | 'vet'
  phone: string | null
}

interface AuthContextValue {
  isAuthenticated: boolean
  loading: boolean
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthCtx = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const saved = await AsyncStorage.getItem(USER_KEY)
        if (saved) setUser(JSON.parse(saved))
      } catch {} finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const u = await db.login(email, password)
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider
      value={{
        isAuthenticated: !!user,
        loading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
