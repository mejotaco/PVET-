import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as db from './db'
import { useAuth } from './AuthContext'

interface Pet {
  id: number
  ownerId: number
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
  userId: number
  date: string
  time: string
  service: string | null
  vetName: string | null
  location: string | null
  status: string
  notes: string | null
  createdAt: string
}

export type ThemeMode = 'system' | 'light' | 'dark'

interface AppContextValue {
  loaded: boolean
  pets: Pet[]
  petVaccines: Record<number, Vaccination[]>
  addPet: (data: any) => Promise<void>
  updatePet: (id: number, data: any) => Promise<void>
  deletePet: (id: number) => Promise<void>
  appointments: Appointment[]
  addAppointment: (data: any) => Promise<void>
  cancelAppointment: (id: number) => Promise<void>
  notifications: boolean
  toggleNotifications: () => void
  refresh: () => Promise<void>
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  getVaccinations: (petId: number) => Promise<Vaccination[]>
  createVaccination: (data: any) => Promise<void>
  getHealthRecords: (petId: number) => Promise<any[]>
  createHealthRecord: (data: any) => Promise<void>
  updateProfile: (data: any) => Promise<void>
}

const AppCtx = createContext<AppContextValue | null>(null)
const THEME_STORAGE_KEY = 'pvet_theme_mode'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading, user: authUser } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [petVaccines, setPetVaccines] = useState<Record<number, Vaccination[]>>({})
  const [notifications, setNotifications] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(val => {
      if (val === 'light' || val === 'dark' || val === 'system') setThemeModeState(val)
    }).catch(() => {})
  }, [])

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {})
  }, [])

  const loadAllData = useCallback(async () => {
    try {
      if (!authUser) return
      const isVet = authUser.role === 'vet'
      let fetchedPets: any[]
      let fetchedAppts: any[]
      if (isVet) {
        fetchedPets = await db.getPets()
        fetchedAppts = await db.getAppointments()
      } else {
        fetchedPets = await db.getPets(authUser.id)
        fetchedAppts = await db.getAppointments(authUser.id)
      }
      setPets(fetchedPets)
      setAppointments(fetchedAppts)

      const vaccinesMap: Record<number, Vaccination[]> = {}
      await Promise.all(fetchedPets.map(async (pet: any) => {
        try {
          const vacs = await db.getVaccinations(pet.id)
          vaccinesMap[pet.id] = vacs
        } catch {}
      }))
      setPetVaccines(vaccinesMap)

      return true
    } catch (err) {
      console.warn('[AppContext] Error al cargar datos:', err)
      return false
    }
  }, [authUser])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setLoaded(true)
      return
    }
    ;(async () => {
      await loadAllData()
      setLoaded(true)
    })()
  }, [authLoading, isAuthenticated, loadAllData])

  const refresh = async () => { await loadAllData() }

  const addPet = async (data: any) => {
    const newPet = await db.createPet({ ...data, ownerId: authUser?.id })
    setPets(prev => [newPet, ...prev])
  }

  const updatePet = async (id: number, data: any) => {
    const updated = await db.updatePet(id, data)
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)))
  }

  const deletePet = async (id: number) => {
    await db.deletePet(id)
    setPets(prev => prev.filter(p => p.id !== id))
    setPetVaccines(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const addAppointment = async (data: any) => {
    const newAppt = await db.createAppointment({ ...data, userId: authUser?.id })
    setAppointments(prev => [newAppt, ...prev])
  }

  const cancelAppointment = async (id: number) => {
    await db.updateAppointment(id, { status: 'cancelled' })
    setAppointments(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'cancelled' } : a))
    )
  }

  const toggleNotifications = () => setNotifications(v => !v)

  const getVaccinations = async (petId: number) => {
    return db.getVaccinations(petId)
  }

  const createVaccination = async (data: any) => {
    await db.createVaccination(data)
    const vacs = await db.getVaccinations(data.petId)
    setPetVaccines(prev => ({ ...prev, [data.petId]: vacs }))
  }

  const getHealthRecords = async (petId: number) => {
    return db.getHealthRecords(petId)
  }

  const createHealthRecord = async (data: any) => {
    await db.createHealthRecord(data)
  }

  const updateProfile = async (data: any) => {
    if (!authUser) return
    await db.updateUser(authUser.id, data)
  }

  return (
    <AppCtx.Provider
      value={{
        loaded,
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
        themeMode,
        setThemeMode,
        getVaccinations,
        createVaccination,
        getHealthRecords,
        createHealthRecord,
        updateProfile,
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
