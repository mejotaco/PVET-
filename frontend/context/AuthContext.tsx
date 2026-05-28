import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from './api'

const TOKEN_KEY = 'pvet_auth_token'

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
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthCtx = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY)
        if (savedToken) {
          api.setToken(savedToken)
          const me = await api.getMe()
          setToken(savedToken)
          setUser(me)
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY)
        api.setToken(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    api.setToken(res.token)
    await AsyncStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    api.setToken(null)
    await AsyncStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider
      value={{
        isAuthenticated: !!token && !!user,
        loading,
        user,
        token,
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
