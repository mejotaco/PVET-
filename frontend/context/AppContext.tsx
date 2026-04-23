import React, { createContext, useContext, useEffect, useState } from 'react'
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

interface AppContextValue {
  loaded: boolean
  serverUrl: string | null
  pets: Pet[]
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => Promise<void>
  updatePet: (id: number, data: Partial<Pet>) => Promise<void>
  deletePet: (id: number) => Promise<void>
  appointments: Appointment[]
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>
  cancelAppointment: (id: number) => Promise<void>
  notifications: boolean
  toggleNotifications: () => void
}

const AppCtx = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notifications, setNotifications] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [serverUrl, setServerUrl] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const url = await api.discover()
        setServerUrl(url)

        const [fetchedPets, fetchedAppts] = await Promise.all([
          api.getPets(),
          api.getAppointments(),
        ])
        setPets(fetchedPets)
        setAppointments(fetchedAppts)
      } catch (err) {
        console.warn('[AppContext] Error al conectar:', err)
      } finally {
        setLoaded(true)
      }
    })()
  }, [])

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

  return (
    <AppCtx.Provider
      value={{
        loaded,
        serverUrl,
        pets,
        addPet,
        updatePet,
        deletePet,
        appointments,
        addAppointment,
        cancelAppointment,
        notifications,
        toggleNotifications,
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