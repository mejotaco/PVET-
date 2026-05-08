const API_TIMEOUT = 3000
const DISCOVERY_TIMEOUT = 2000

interface ServerInfo {
  ip: string
  port: number
  baseUrl: string
  status: string
}

class APIClient {
  private baseUrl: string | null = null
  private discoveryUrls = this.buildDiscoveryUrls()

  private buildDiscoveryUrls(): string[] {
    const urls = [
      'http://localhost:4000',
      'http://127.0.0.1:4000',
    ]
    const commonIPs = [
      '192.168.100.9',
      '192.168.100.10',
      '192.168.1.100',
      '192.168.0.100',
      '192.168.1.45',
      '192.168.0.45',
    ]
    for (const ip of commonIPs) {
      urls.push(`http://${ip}:4000`)
    }
    return urls
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

  async discover(): Promise<string> {
    if (this.baseUrl) return this.baseUrl

    const results = await Promise.all(
      this.discoveryUrls.map(url => this.tryUrl(url))
    )
    for (const result of results) {
      if (result) {
        this.baseUrl = result
        console.log('[API] Conectado a:', this.baseUrl)
        return this.baseUrl
      }
    }

    this.baseUrl = this.discoveryUrls[0]
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
    const res = await this.fetchWithTimeout(url, {
      headers: { 'Content-Type': 'application/json' },
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
}

export const api = new APIClient()