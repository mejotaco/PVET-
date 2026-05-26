import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from './api'

interface Pet {
  id: number
  name: string
  species: string | null
  breed: string | null
  age: number | null
  weight: number | null
  colorTheme: string
  microchip: string | null
  ownerName: string | null
  ownerPhone: string | null
  notes: string | null
  imageUri: string | null
  createdAt: string
}

interface Vaccination {
  id: number
  petId: number
  name: string
  dateApplied: string
  nextDue: string | null
  vetName: string | null
  notes: string | null
}

interface Appointment {
  id: number
  petId: number
  date: string
  time: string
  type: string | null
  vetName: string | null
  location: string | null
  status: string
  notes: string | null
  createdAt: string
}

interface UserProfile {
  id: number
  name: string
  email: string | null
  phone: string | null
  notes: string | null
}

export type ThemeMode = 'system' | 'light' | 'dark'

interface AppContextValue {
  loaded: boolean
  serverUrl: string | null
  pets: Pet[]
  petVaccines: Record<number, Vaccination[]>
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => Promise<void>
  updatePet: (id: number, data: Partial<Pet>) => Promise<void>
  deletePet: (id: number) => Promise<void>
  appointments: Appointment[]
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>
  cancelAppointment: (id: number) => Promise<void>
  notifications: boolean
  toggleNotifications: () => void
  refresh: () => Promise<void>
  user: UserProfile | null
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

const AppCtx = createContext<AppContextValue | null>(null)
const THEME_STORAGE_KEY = 'pvet_theme_mode'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [petVaccines, setPetVaccines] = useState<Record<number, Vaccination[]>>({})
  const [notifications, setNotifications] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(val => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setThemeModeState(val)
      }
    }).catch(() => {})
  }, [])

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {})
  }, [])

  const loadAllData = useCallback(async () => {
    try {
      const [fetchedPets, fetchedAppts] = await Promise.all([
        api.getPets(),
        api.getAppointments(),
      ])
      setPets(fetchedPets)
      setAppointments(fetchedAppts)

      const vaccinesMap: Record<number, Vaccination[]> = {}
      await Promise.all(fetchedPets.map(async (pet: Pet) => {
        try {
          const vacs = await api.getVaccinations(pet.id)
          vaccinesMap[pet.id] = vacs
        } catch { }
      }))
      setPetVaccines(vaccinesMap)

      return true
    } catch (err) {
      console.warn('[AppContext] Error al conectar:', err)
      return false
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const url = await api.discover()
        setServerUrl(url)

        const profile = await api.getProfile()
        if (profile) setUser(profile)

        await loadAllData()
      } catch (err) {
        console.warn('[AppContext] Error:', err)
      } finally {
        setLoaded(true)
      }
    })()
  }, [loadAllData])

  const refresh = async () => {
    await loadAllData()
  }

  const addPet = async (pet: Omit<Pet, 'id' | 'createdAt'>) => {
    try {
      const newPet = await api.createPet(pet)
      setPets(prev => [newPet, ...prev])
    } catch (err) {
      console.warn('[AppContext] addPet error:', err)
      throw err
    }
  }

  const updatePet = async (id: number, data: Partial<Pet>) => {
    try {
      const updated = await api.updatePet(id, data)
      setPets(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)))
    } catch (err) {
      console.warn('[AppContext] updatePet error:', err)
      throw err
    }
  }

  const deletePet = async (id: number) => {
    try {
      await api.deletePet(id)
      setPets(prev => prev.filter(p => p.id !== id))
      setPetVaccines(prev => { const n = { ...prev }; delete n[id]; return n })
    } catch (err) {
      console.warn('[AppContext] deletePet error:', err)
      throw err
    }
  }

  const addAppointment = async (a: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      const newAppt = await api.createAppointment(a)
      setAppointments(prev => [newAppt, ...prev])
    } catch (err) {
      console.warn('[AppContext] addAppointment error:', err)
      throw err
    }
  }

  const cancelAppointment = async (id: number) => {
    try {
      await api.cancelAppointment(id)
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: 'cancelled' } : a))
      )
    } catch (err) {
      console.warn('[AppContext] cancelAppointment error:', err)
      throw err
    }
  }

  const toggleNotifications = () => setNotifications(v => !v)

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
    const updated = await api.updateProfile(user.id, data)
    setUser(updated)
  }

  return (
    <AppCtx.Provider
      value={{
        loaded,
        serverUrl,
        pets,
        petVaccines,
        addPet,
        updatePet,
        deletePet,
        appointments,
        addAppointment,
        cancelAppointment,
        notifications,
        toggleNotifications,
        refresh,
        user,
        updateProfile,
        themeMode,
        setThemeMode,
      }}
    >
      {children}
    </AppCtx.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
