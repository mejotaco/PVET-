import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const API_TIMEOUT = 3000
const DISCOVERY_TIMEOUT = 2000
const CACHE_KEY = 'pvet_server_url'
const PORT = 4000

function getDeviceSubnet(): string | null {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost
    if (hostUri) {
      const ip = hostUri.split(':')[0]
      const parts = ip.split('.')
      if (parts.length === 4) return parts.slice(0, 3).join('.')
    }
  } catch {}
  return null
}

interface ServerInfo {
  ip: string
  port: number
  baseUrl: string
  status: string
}

class APIClient {
  private baseUrl: string | null = null
  private token: string | null = null

  setToken(token: string | null): void {
    this.token = token
  }

  private buildDiscoveryUrls(): string[] {
    const urls: string[] = [
      'http://localhost:4000',
      'http://127.0.0.1:4000',
    ]
    const deviceSubnet = getDeviceSubnet()
    const subnets: string[] = []
    if (deviceSubnet) {
      subnets.push(deviceSubnet)
      urls.push(`http://${deviceSubnet}.1:${PORT}`)
      urls.push(`http://${deviceSubnet}.100:${PORT}`)
      urls.push(`http://${deviceSubnet}.150:${PORT}`)
      urls.push(`http://${deviceSubnet}.200:${PORT}`)
      urls.push(`http://${deviceSubnet}.254:${PORT}`)
    }
    subnets.push('192.168.0', '192.168.1', '192.168.100', '10.0.0')
    const commonHosts = [1, 100, 101, 102, 150, 200, 201, 250, 254]
    for (const subnet of subnets) {
      for (const host of commonHosts) {
        urls.push(`http://${subnet}.${host}:${PORT}`)
      }
    }
    for (const subnet of subnets) {
      for (let i = 1; i <= 254; i++) {
        urls.push(`http://${subnet}.${i}:${PORT}`)
      }
    }
    return urls
  }

  private async loadCachedUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CACHE_KEY)
    } catch {
      return null
    }
  }

  private async saveCachedUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEY, url)
    } catch {}
  }

  async setBaseUrl(url: string): Promise<void> {
    this.baseUrl = url
    await this.saveCachedUrl(url)
  }

  async clearCachedUrl(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY)
    } catch {}
  }

  private async fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT)
    try {
      return await fetch(url, { ...options, signal: controller.signal })
    } finally {
      clearTimeout(timeout)
    }
  }

  private async tryUrl(url: string): Promise<string | null> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), DISCOVERY_TIMEOUT)
      const res = await fetch(`${url}/api/info`, { signal: controller.signal })
      clearTimeout(timeout)
      if (res.ok) {
        const data: ServerInfo = await res.json()
        return data.baseUrl || url
      }
    } catch {}
    return null
  }

  private tryAny(urls: string[], batchSize = 50): Promise<string | null> {
    return new Promise((resolve) => {
      let index = 0
      let found = false
      const nextBatch = () => {
        if (found) return
        const batch = urls.slice(index, index + batchSize)
        if (batch.length === 0) return resolve(null)
        index += batchSize
        let pending = batch.length
        for (const url of batch) {
          this.tryUrl(url).then((result) => {
            if (found) return
            if (result) {
              found = true
              resolve(result)
              return
            }
            pending--
            if (pending === 0) nextBatch()
          })
        }
      }
      nextBatch()
    })
  }

  async discover(): Promise<string> {
    if (this.baseUrl) return this.baseUrl

    const cached = await this.loadCachedUrl()
    if (cached) {
      const result = await this.tryUrl(cached)
      if (result) {
        this.baseUrl = result
        console.log('[API] Conectado a (cache):', this.baseUrl)
        return this.baseUrl
      }
    }

    const urls = this.buildDiscoveryUrls()
    const result = await this.tryAny(urls)
    if (result) {
      this.baseUrl = result
      await this.saveCachedUrl(result)
      console.log('[API] Conectado a:', this.baseUrl)
      return this.baseUrl
    }

    this.baseUrl = 'http://localhost:4000'
    console.warn('[API] No se encontró servidor, usando:', this.baseUrl)
    return this.baseUrl
  }

  async isConnected(): Promise<boolean> {
    try {
      const base = await this.discover()
      const res = await this.fetchWithTimeout(`${base}/api/info`)
      return res.ok
    } catch {
      return false
    }
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const base = await this.discover()
    const url = `${base}${path}`
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    const res = await this.fetchWithTimeout(url, {
      headers,
      ...options,
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  // ─── Mascotas ───────────────────────────────────────────────

  async getPets() {
    return this.request<any[]>('/api/pets')
  }

  async createPet(pet: Omit<any, 'id'>) {
    return this.request<any>('/api/pets', {
      method: 'POST',
      body: JSON.stringify(pet),
    })
  }

  async updatePet(id: number, pet: Partial<any>) {
    return this.request<any>(`/api/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pet),
    })
  }

  async deletePet(id: number) {
    return this.request<any>(`/api/pets/${id}`, { method: 'DELETE' })
  }

  // ─── Citas ──────────────────────────────────────────────────

  async getAppointments() {
    return this.request<any[]>('/api/appointments')
  }

  async getAppointmentsByPet(petId: number) {
    return this.request<any[]>(`/api/appointments/pet/${petId}`)
  }

  async createAppointment(appt: Omit<any, 'id'>) {
    return this.request<any>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appt),
    })
  }

  async updateAppointment(id: number, appt: Partial<any>) {
    return this.request<any>(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(appt),
    })
  }

  async cancelAppointment(id: number) {
    return this.updateAppointment(id, { status: 'cancelled' })
  }

  async deleteAppointment(id: number) {
    return this.request<any>(`/api/appointments/${id}`, { method: 'DELETE' })
  }

  // ─── Salud ──────────────────────────────────────────────────

  async getHealthRecords() {
    return this.request<any[]>('/api/health-records')
  }

  async getHealthRecordsByPet(petId: number) {
    return this.request<any[]>(`/api/health-records/pet/${petId}`)
  }

  async createHealthRecord(record: Omit<any, 'id'>) {
    return this.request<any>('/api/health-records', {
      method: 'POST',
      body: JSON.stringify(record),
    })
  }

  async deleteHealthRecord(id: number) {
    return this.request<any>(`/api/health-records/${id}`, { method: 'DELETE' })
  }

  // ─── Vacunas ──────────────────────────────────────────────

  async getVaccinations(petId: number) {
    return this.request<any[]>(`/api/vaccinations/pet/${petId}`)
  }

  async createVaccination(vacc: Omit<any, 'id'>) {
    return this.request<any>('/api/vaccinations', {
      method: 'POST',
      body: JSON.stringify(vacc),
    })
  }

  // ─── Medicamentos ──────────────────────────────────────────

  async getMedications(petId: number) {
    return this.request<any[]>(`/api/medications/pet/${petId}`)
  }

  async createMedication(med: Omit<any, 'id'>) {
    return this.request<any>('/api/medications', {
      method: 'POST',
      body: JSON.stringify(med),
    })
  }

  async toggleMedication(id: number) {
    return this.request<any>(`/api/medications/${id}/toggle`, { method: 'PATCH' })
  }

  // ─── Auth ──────────────────────────────────────────────────

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getMe() {
    return this.request<any>('/api/auth/me')
  }

  // ─── Admin ─────────────────────────────────────────────────

  async getAdminStats() {
    return this.request<any>('/api/admin/stats')
  }

  async getOwners() {
    return this.request<any[]>('/api/users/owners')
  }

  async getPetsByOwner(ownerId: number) {
    return this.request<any[]>(`/api/users/${ownerId}/pets`)
  }

  async getAppointmentsByOwner(ownerId: number) {
    return this.request<any[]>(`/api/users/${ownerId}/appointments`)
  }

  // ─── Perfil de usuario ─────────────────────────────────────

  async getProfile() {
    return this.request<any | null>('/api/users')
  }

  async updateProfile(id: number, data: { name?: string; email?: string; phone?: string; notes?: string }) {
    return this.request<any>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

export const api = new APIClient()