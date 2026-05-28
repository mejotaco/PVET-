import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('pvet.db')
    await initTables()
    await seedIfEmpty()
  }
  return db
}

async function initTables() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      password TEXT,
      role TEXT DEFAULT 'owner',
      phone TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      name TEXT NOT NULL,
      species TEXT,
      breed TEXT,
      age INTEGER,
      weight REAL,
      colorTheme TEXT DEFAULT '#FF7A2F',
      microchip TEXT,
      ownerName TEXT,
      ownerPhone TEXT,
      notes TEXT,
      imageUri TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (ownerId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      petId INTEGER,
      userId INTEGER,
      date TEXT,
      time TEXT,
      service TEXT,
      type TEXT,
      vetName TEXT,
      location TEXT,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (petId) REFERENCES pets(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      petId INTEGER,
      date TEXT,
      type TEXT,
      description TEXT,
      weight REAL,
      vetName TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (petId) REFERENCES pets(id)
    );
    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      petId INTEGER,
      name TEXT,
      dateApplied TEXT,
      nextDue TEXT,
      vetName TEXT,
      notes TEXT,
      FOREIGN KEY (petId) REFERENCES pets(id)
    );
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      petId INTEGER,
      name TEXT,
      dosage TEXT,
      frequency TEXT,
      startDate TEXT,
      endDate TEXT,
      active INTEGER DEFAULT 1,
      notes TEXT,
      FOREIGN KEY (petId) REFERENCES pets(id)
    );
  `)
}

async function seedIfEmpty() {
  const row = await db.getFirstAsync('SELECT id FROM users LIMIT 1')
  if (row) return
  await db.runAsync(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    'Juan García', 'juan@ejemplo.com', 'owner123', 'owner'
  )
  await db.runAsync(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    'Dr. María López', 'vet@ejemplo.com', 'vet123', 'vet'
  )
  await db.runAsync(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    'Ana Martínez', 'ana@ejemplo.com', 'owner123', 'owner'
  )
}

export async function login(email: string, password: string) {
  const d = await getDB()
  const user = await d.getFirstAsync<any>(
    'SELECT id, name, email, role, phone, notes FROM users WHERE email = ? AND password = ?',
    email, password
  )
  if (!user) throw new Error('Credenciales inválidas')
  return user
}

export async function getUser(id: number) {
  const d = await getDB()
  return d.getFirstAsync<any>(
    'SELECT id, name, email, role, phone, notes, createdAt FROM users WHERE id = ?', id
  )
}

export async function updateUser(id: number, data: { name?: string; email?: string; phone?: string; notes?: string }) {
  const d = await getDB()
  const fields: string[] = []
  const vals: any[] = []
  if (data.name !== undefined) { fields.push('name = ?'); vals.push(data.name) }
  if (data.email !== undefined) { fields.push('email = ?'); vals.push(data.email) }
  if (data.phone !== undefined) { fields.push('phone = ?'); vals.push(data.phone) }
  if (data.notes !== undefined) { fields.push('notes = ?'); vals.push(data.notes) }
  if (fields.length === 0) return
  vals.push(id)
  await d.runAsync(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, ...vals)
  return getUser(id)
}

export async function getPets(ownerId?: number) {
  const d = await getDB()
  if (ownerId) {
    return d.getAllAsync<any>('SELECT * FROM pets WHERE ownerId = ? ORDER BY createdAt DESC', ownerId)
  }
  return d.getAllAsync<any>('SELECT * FROM pets ORDER BY createdAt DESC')
}

export async function createPet(data: any) {
  const d = await getDB()
  const r = await d.runAsync(
    `INSERT INTO pets (ownerId, name, species, breed, age, weight, colorTheme, microchip, ownerName, ownerPhone, notes, imageUri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.ownerId || null, data.name, data.species || null, data.breed || null,
    data.age || null, data.weight || null, data.colorTheme || '#FF7A2F',
    data.microchip || null, data.ownerName || null, data.ownerPhone || null,
    data.notes || null, data.imageUri || null
  )
  return d.getFirstAsync<any>('SELECT * FROM pets WHERE id = ?', r.lastInsertRowId)
}

export async function updatePet(id: number, data: any) {
  const d = await getDB()
  const fields: string[] = []
  const vals: any[] = []
  for (const k of ['name','species','breed','age','weight','colorTheme','microchip','ownerName','ownerPhone','notes','imageUri']) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); vals.push(data[k]) }
  }
  if (fields.length === 0) return
  vals.push(id)
  await d.runAsync(`UPDATE pets SET ${fields.join(', ')} WHERE id = ?`, ...vals)
  return d.getFirstAsync<any>('SELECT * FROM pets WHERE id = ?', id)
}

export async function deletePet(id: number) {
  const d = await getDB()
  await d.runAsync('DELETE FROM appointments WHERE petId = ?', id)
  await d.runAsync('DELETE FROM health_records WHERE petId = ?', id)
  await d.runAsync('DELETE FROM vaccinations WHERE petId = ?', id)
  await d.runAsync('DELETE FROM medications WHERE petId = ?', id)
  await d.runAsync('DELETE FROM pets WHERE id = ?', id)
}

export async function getAppointments(userId?: number) {
  const d = await getDB()
  if (userId) {
    return d.getAllAsync<any>(
      `SELECT a.*, p.name as petName, p.species as petSpecies, p.colorTheme as petColor
       FROM appointments a LEFT JOIN pets p ON a.petId = p.id
       WHERE a.userId = ? ORDER BY a.date DESC, a.time DESC`, userId
    )
  }
  return d.getAllAsync<any>(
    `SELECT a.*, p.name as petName, p.species as petSpecies, p.colorTheme as petColor
     FROM appointments a LEFT JOIN pets p ON a.petId = p.id
     ORDER BY a.date DESC, a.time DESC`
  )
}

export async function createAppointment(data: any) {
  const d = await getDB()
  const r = await d.runAsync(
    `INSERT INTO appointments (petId, userId, date, time, service, type, vetName, location, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.petId || null, data.userId || null, data.date || null, data.time || null,
    data.service || null, data.type || null, data.vetName || data.vet || null,
    data.location || null, data.status || 'scheduled', data.notes || null
  )
  return d.getFirstAsync<any>('SELECT * FROM appointments WHERE id = ?', r.lastInsertRowId)
}

export async function updateAppointment(id: number, data: any) {
  const d = await getDB()
  const fields: string[] = []
  const vals: any[] = []
  for (const k of ['petId','date','time','service','type','vetName','location','status','notes']) {
    if (data[k] !== undefined) { fields.push(k === 'vetName' ? 'vetName = ?' : `${k} = ?`); vals.push(data[k]) }
  }
  if (data.vet !== undefined && data.vetName === undefined) { fields.push('vetName = ?'); vals.push(data.vet) }
  if (fields.length === 0) return
  vals.push(id)
  await d.runAsync(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`, ...vals)
  return d.getFirstAsync<any>('SELECT * FROM appointments WHERE id = ?', id)
}

export async function deleteAppointment(id: number) {
  const d = await getDB()
  await d.runAsync('DELETE FROM appointments WHERE id = ?', id)
}

export async function getHealthRecords(petId: number) {
  const d = await getDB()
  return d.getAllAsync<any>('SELECT * FROM health_records WHERE petId = ? ORDER BY date DESC', petId)
}

export async function createHealthRecord(data: any) {
  const d = await getDB()
  const r = await d.runAsync(
    `INSERT INTO health_records (petId, date, type, description, weight, vetName, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.petId, data.date || null, data.type || null, data.description || null,
    data.weight || null, data.vetName || null, data.notes || null
  )
  return d.getFirstAsync<any>('SELECT * FROM health_records WHERE id = ?', r.lastInsertRowId)
}

export async function deleteHealthRecord(id: number) {
  const d = await getDB()
  await d.runAsync('DELETE FROM health_records WHERE id = ?', id)
}

export async function getVaccinations(petId: number) {
  const d = await getDB()
  return d.getAllAsync<any>('SELECT * FROM vaccinations WHERE petId = ? ORDER BY dateApplied DESC', petId)
}

export async function createVaccination(data: any) {
  const d = await getDB()
  const r = await d.runAsync(
    `INSERT INTO vaccinations (petId, name, dateApplied, nextDue, vetName, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.petId, data.name || null, data.dateApplied || null,
    data.nextDue || null, data.vetName || null, data.notes || null
  )
  return d.getFirstAsync<any>('SELECT * FROM vaccinations WHERE id = ?', r.lastInsertRowId)
}

export async function getMedications(petId: number) {
  const d = await getDB()
  return d.getAllAsync<any>('SELECT * FROM medications WHERE petId = ? ORDER BY startDate DESC', petId)
}

export async function createMedication(data: any) {
  const d = await getDB()
  const r = await d.runAsync(
    `INSERT INTO medications (petId, name, dosage, frequency, startDate, endDate, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.petId, data.name, data.dosage || null, data.frequency || null,
    data.startDate || null, data.endDate || null, data.notes || null
  )
  return d.getFirstAsync<any>('SELECT * FROM medications WHERE id = ?', r.lastInsertRowId)
}

export async function toggleMedication(id: number) {
  const d = await getDB()
  const med = await d.getFirstAsync<any>('SELECT active FROM medications WHERE id = ?', id)
  if (!med) return
  await d.runAsync('UPDATE medications SET active = ? WHERE id = ?', med.active ? 0 : 1, id)
  return d.getFirstAsync<any>('SELECT * FROM medications WHERE id = ?', id)
}

export async function getUsers() {
  const d = await getDB()
  return d.getAllAsync<any>('SELECT id, name, email, role, phone, notes, createdAt FROM users ORDER BY name ASC')
}

export async function getOwners() {
  const d = await getDB()
  return d.getAllAsync<any>(
    "SELECT id, name, email, phone, notes, createdAt FROM users WHERE role = 'owner' ORDER BY name ASC"
  )
}

export async function getPetsByOwner(ownerId: number) {
  const d = await getDB()
  return d.getAllAsync<any>('SELECT * FROM pets WHERE ownerId = ? ORDER BY name ASC', ownerId)
}

export async function getAppointmentsByOwner(ownerId: number) {
  const d = await getDB()
  return d.getAllAsync<any>(
    `SELECT a.*, p.name as petName, p.species as petSpecies, p.colorTheme as petColor
     FROM appointments a LEFT JOIN pets p ON a.petId = p.id
     WHERE p.ownerId = ? ORDER BY a.date DESC`, ownerId
  )
}

export async function getAdminStats() {
  const d = await getDB()
  const counts = await d.getFirstAsync<any>(`
    SELECT
      (SELECT COUNT(*) FROM pets) as pets,
      (SELECT COUNT(*) FROM appointments) as appointments,
      (SELECT COUNT(*) FROM health_records) as healthRecords,
      (SELECT COUNT(*) FROM vaccinations) as vaccinations,
      (SELECT COUNT(*) FROM medications) as medications,
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM appointments WHERE status = 'scheduled' AND date >= date('now')) as upcomingAppointments,
      (SELECT COUNT(*) FROM appointments WHERE status = 'completed') as completedAppointments
  `)
  const recentPets = await d.getAllAsync<any>(
    'SELECT id, name, species, createdAt FROM pets ORDER BY createdAt DESC LIMIT 5'
  )
  const recentAppointments = await d.getAllAsync<any>(
    `SELECT a.id, a.service, a.date, a.time, a.status, COALESCE(p.name, 'Mascota eliminada') as petName
     FROM appointments a LEFT JOIN pets p ON a.petId = p.id
     ORDER BY a.createdAt DESC LIMIT 5`
  )
  return { counts, recentPets, recentAppointments }
}
