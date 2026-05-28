require('dotenv').config()

const express    = require('express')
const mysql      = require('mysql2/promise')
const cors       = require('cors')
const os         = require('os')
const jwt        = require('jsonwebtoken')
const bcrypt     = require('bcryptjs')

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'pvet_secret_key_2024'
const JWT_EXPIRES = '30d'

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return '127.0.0.1'
}

const PORT = process.env.PORT || 4000

app.get('/api/info', (req, res) => {
  const serverIP = process.env.HOST_IP || getLocalIP()
  res.json({
    ip: serverIP,
    port: PORT,
    baseUrl: `http://${serverIP}:${PORT}`,
    status: 'ok'
  })
})

const poolConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

let pool

async function initDB() {
  let conn
  try {
    const initPool = mysql.createPool(poolConfig)
    conn = await initPool.getConnection()

    await conn.query(
      `CREATE DATABASE IF NOT EXISTS pvet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    await conn.query(`USE pvet_db`)
    conn.release()

    pool = mysql.createPool({ ...poolConfig, database: 'pvet_db' })

    await conn.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id          INT          AUTO_INCREMENT PRIMARY KEY,
        ownerId     INT,
        name        VARCHAR(100) NOT NULL,
        species     VARCHAR(50),
        breed       VARCHAR(100),
        age         INT,
        weight      DECIMAL(6,2),
        colorTheme  VARCHAR(50),
        microchip   VARCHAR(100),
        ownerName   VARCHAR(100),
        ownerPhone  VARCHAR(20),
        notes       TEXT,
        imageUri    TEXT,
        createdAt   DATETIME     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `)

    // Migrate: add ownerId if missing
    try { await conn.query('SELECT ownerId FROM pets LIMIT 1') }
    catch { await conn.query('ALTER TABLE pets ADD COLUMN ownerId INT AFTER id') }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id          INT          AUTO_INCREMENT PRIMARY KEY,
        petId       INT,
        service     VARCHAR(100),
        date        VARCHAR(10),
        time        VARCHAR(5),
        vet         VARCHAR(100),
        location    VARCHAR(200),
        status      ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
        notes       TEXT,
        createdAt   DATETIME     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS health_records (
        id          INT          AUTO_INCREMENT PRIMARY KEY,
        petId       INT,
        date        VARCHAR(10),
        type        VARCHAR(100),
        description TEXT,
        weight      DECIMAL(6,2),
        vetName     VARCHAR(100),
        notes       TEXT,
        createdAt   DATETIME     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vaccinations (
        id          INT          AUTO_INCREMENT PRIMARY KEY,
        petId       INT,
        name        VARCHAR(100) NOT NULL,
        dateApplied VARCHAR(10),
        nextDue     VARCHAR(10),
        vetName     VARCHAR(100),
        notes       TEXT,
        createdAt   DATETIME     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id          INT          AUTO_INCREMENT PRIMARY KEY,
        petId       INT,
        name        VARCHAR(100) NOT NULL,
        dosage      VARCHAR(50),
        frequency   VARCHAR(100),
        startDate   VARCHAR(10),
        endDate     VARCHAR(10),
        notes       TEXT,
        active      TINYINT(1)   DEFAULT 1,
        createdAt   DATETIME     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          INT          AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150),
        password    VARCHAR(255),
        role        ENUM('owner','vet') DEFAULT 'owner',
        phone       VARCHAR(20),
        notes       TEXT,
        createdAt   DATETIME     DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `)

    // Migrate: add columns if missing
    try { await conn.query('SELECT password FROM users LIMIT 1') }
    catch { await conn.query('ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER email') }
    try { await conn.query('SELECT role FROM users LIMIT 1') }
    catch { await conn.query("ALTER TABLE users ADD COLUMN role ENUM('owner','vet') DEFAULT 'owner' AFTER password") }

    const [existing] = await conn.query('SELECT id FROM users LIMIT 1')
    if (existing.length === 0) {
      const ownerHash = await bcrypt.hash('owner123', 10)
      const vetHash   = await bcrypt.hash('vet123', 10)
      await conn.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Juan García', 'juan@ejemplo.com', ownerHash, 'owner']
      )
      await conn.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Dr. María López', 'vet@ejemplo.com', vetHash, 'vet']
      )
    } else {
      // Ensure existing user has password set
      const [row] = await conn.query('SELECT password FROM users WHERE id = 1')
      if (!row[0]?.password) {
        const hash = await bcrypt.hash('owner123', 10)
        await conn.query('UPDATE users SET password = ?, role = ? WHERE id = 1', [hash, 'owner'])
      }
      // Ensure vet user exists
      const [vetRow] = await conn.query("SELECT id FROM users WHERE role = 'vet' LIMIT 1")
      if (vetRow.length === 0) {
        const vetHash = await bcrypt.hash('vet123', 10)
        await conn.query(
          `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
          ['Dr. María López', 'vet@ejemplo.com', vetHash, 'vet']
        )
      }
      // Ensure second owner exists
      const [anaRow] = await conn.query("SELECT id FROM users WHERE email = 'ana@ejemplo.com' LIMIT 1")
      if (anaRow.length === 0) {
        const hash = await bcrypt.hash('owner123', 10)
        await conn.query(
          `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
          ['Ana Martínez', 'ana@ejemplo.com', hash, 'owner']
        )
      }
    }

    console.log(' Base de datos pvet_db lista')
  } catch (err) {
    console.error(' Error en initDB:', err)
    throw err
  } finally {
    if (conn) conn.release()
  }
}

// ─── MASCOTAS ───────────────────────────────────────────────

app.get('/api/pets', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT p.*, u.name AS ownerUserName FROM pets p LEFT JOIN users u ON p.ownerId = u.id'
    const params = []
    if (req.user.role === 'owner') {
      query += ' WHERE p.ownerId = ?'
      params.push(req.user.id)
    }
    query += ' ORDER BY p.id DESC'
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/pets', authenticateToken, async (req, res) => {
  try {
    const r = req.body
    const ownerId = req.user.role === 'owner' ? req.user.id : (r.ownerId || null)
    const [result] = await pool.query(
      `INSERT INTO pets (ownerId, name, species, breed, age, weight, colorTheme, microchip, ownerName, ownerPhone, notes, imageUri)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ownerId, r.name, r.species, r.breed, r.age, r.weight, r.colorTheme, r.microchip, r.ownerName, r.ownerPhone, r.notes, r.imageUri]
    )
    const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/pets/:id', authenticateToken, async (req, res) => {
  try {
    const r = req.body
    // Owners can only update their own pets
    if (req.user.role === 'owner') {
      const [check] = await pool.query('SELECT id FROM pets WHERE id = ? AND ownerId = ?', [req.params.id, req.user.id])
      if (!check.length) return res.status(403).json({ error: 'No autorizado' })
    }
    await pool.query(
      `UPDATE pets SET name=?, species=?, breed=?, age=?, weight=?, colorTheme=?, microchip=?, ownerName=?, ownerPhone=?, notes=?, imageUri=? WHERE id=?`,
      [r.name, r.species, r.breed, r.age, r.weight, r.colorTheme, r.microchip, r.ownerName, r.ownerPhone, r.notes, r.imageUri, req.params.id]
    )
    const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [req.params.id])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/pets/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'owner') {
      const [check] = await pool.query('SELECT id FROM pets WHERE id = ? AND ownerId = ?', [req.params.id, req.user.id])
      if (!check.length) return res.status(403).json({ error: 'No autorizado' })
    }
    await pool.query('DELETE FROM pets WHERE id=?', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── CITAS ──────────────────────────────────────────────────

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT a.*, p.name AS petName FROM appointments a LEFT JOIN pets p ON a.petId = p.id'
    const params = []
    if (req.user.role === 'owner') {
      query += ' WHERE p.ownerId = ?'
      params.push(req.user.id)
    }
    query += ' ORDER BY a.date DESC, a.time DESC'
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/appointments/pet/:petId', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE petId = ? ORDER BY date DESC, time DESC', [req.params.petId])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const r = req.body
    const [result] = await pool.query(
      `INSERT INTO appointments (petId, service, date, time, vet, location, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.petId, r.service, r.date, r.time, r.vet, r.location, r.status || 'scheduled', r.notes]
    )
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.patch('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const r = req.body
    const fields = []
    const values = []
    if (r.service !== undefined) { fields.push('service = ?'); values.push(r.service) }
    if (r.date !== undefined) { fields.push('date = ?'); values.push(r.date) }
    if (r.time !== undefined) { fields.push('time = ?'); values.push(r.time) }
    if (r.vet !== undefined) { fields.push('vet = ?'); values.push(r.vet) }
    if (r.location !== undefined) { fields.push('location = ?'); values.push(r.location) }
    if (r.status !== undefined) { fields.push('status = ?'); values.push(r.status) }
    if (r.notes !== undefined) { fields.push('notes = ?'); values.push(r.notes) }
    if (fields.length === 0) return res.json({ ok: true })
    values.push(req.params.id)
    await pool.query(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`, values)
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [req.params.id])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id=?', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── SALUD ───────────────────────────────────────────────────

app.get('/api/health-records', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT h.*, p.name AS petName FROM health_records h LEFT JOIN pets p ON h.petId = p.id'
    const params = []
    if (req.user.role === 'owner') {
      query += ' WHERE p.ownerId = ?'
      params.push(req.user.id)
    }
    query += ' ORDER BY h.date DESC'
    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/health-records/pet/:petId', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_records WHERE petId = ? ORDER BY date DESC', [req.params.petId])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/health-records', authenticateToken, async (req, res) => {
  try {
    const r = req.body
    const [result] = await pool.query(
      `INSERT INTO health_records (petId, date, type, description, weight, vetName, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [r.petId, r.date, r.type, r.description, r.weight, r.vetName, r.notes]
    )
    const [rows] = await pool.query('SELECT * FROM health_records WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/health-records/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM health_records WHERE id=?', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── VACUNAS ────────────────────────────────────────────────

app.get('/api/vaccinations/pet/:petId', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vaccinations WHERE petId = ? ORDER BY dateApplied DESC', [req.params.petId])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/vaccinations', authenticateToken, async (req, res) => {
  try {
    const r = req.body
    const [result] = await pool.query(
      `INSERT INTO vaccinations (petId, name, dateApplied, nextDue, vetName, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [r.petId, r.name, r.dateApplied, r.nextDue, r.vetName, r.notes]
    )
    const [rows] = await pool.query('SELECT * FROM vaccinations WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── MEDICAMENTOS ───────────────────────────────────────────

app.get('/api/medications/pet/:petId', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medications WHERE petId = ? ORDER BY startDate DESC', [req.params.petId])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/medications', authenticateToken, async (req, res) => {
  try {
    const r = req.body
    const [result] = await pool.query(
      `INSERT INTO medications (petId, name, dosage, frequency, startDate, endDate, notes, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.petId, r.name, r.dosage, r.frequency, r.startDate, r.endDate, r.notes, r.active ? 1 : 0]
    )
    const [rows] = await pool.query('SELECT * FROM medications WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.patch('/api/medications/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT active FROM medications WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    const newActive = rows[0].active ? 0 : 1
    await pool.query('UPDATE medications SET active = ? WHERE id = ?', [newActive, req.params.id])
    const [updated] = await pool.query('SELECT * FROM medications WHERE id = ?', [req.params.id])
    res.json(updated[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── AUTH MIDDLEWARE ────────────────────────────────────────

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' })
    req.user = decoded
    next()
  })
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso no autorizado' })
    }
    next()
  }
}

// ─── AUTH ───────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, notes, createdAt FROM users WHERE id = ?',
      [req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── CLIENTES (para vet) ────────────────────────────────────

app.get('/api/users/owners', authenticateToken, requireRole('vet'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, notes, createdAt FROM users WHERE role = 'owner' ORDER BY name ASC`
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/users/:id/pets', authenticateToken, requireRole('vet'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM pets WHERE ownerId = ? ORDER BY name ASC',
      [req.params.id]
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/users/:id/appointments', authenticateToken, requireRole('vet'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, p.name AS petName FROM appointments a
       JOIN pets p ON a.petId = p.id
       WHERE p.ownerId = ?
       ORDER BY a.date DESC, a.time DESC`,
      [req.params.id]
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── ADMIN ──────────────────────────────────────────────────

app.get('/api/admin/stats', authenticateToken, requireRole('vet'), async (req, res) => {
  try {
    const [pets]       = await pool.query('SELECT COUNT(*) AS total FROM pets')
    const [appts]      = await pool.query('SELECT COUNT(*) AS total FROM appointments')
    const [health]     = await pool.query('SELECT COUNT(*) AS total FROM health_records')
    const [vaccs]      = await pool.query('SELECT COUNT(*) AS total FROM vaccinations')
    const [meds]       = await pool.query('SELECT COUNT(*) AS total FROM medications')
    const [users]      = await pool.query('SELECT COUNT(*) AS total FROM users')
    const [upcoming]   = await pool.query(
      "SELECT COUNT(*) AS total FROM appointments WHERE status = 'scheduled' AND date >= CURDATE()"
    )
    const [completed]  = await pool.query(
      "SELECT COUNT(*) AS total FROM appointments WHERE status = 'completed'"
    )
    const [recentPets] = await pool.query('SELECT id, name, species, createdAt FROM pets ORDER BY createdAt DESC LIMIT 5')
    const [recentAppts]= await pool.query(
      `SELECT a.id, a.service, a.date, a.time, a.status, p.name AS petName
       FROM appointments a LEFT JOIN pets p ON a.petId = p.id
       ORDER BY a.createdAt DESC LIMIT 5`
    )

    res.json({
      counts: {
        pets: pets[0].total,
        appointments: appts[0].total,
        healthRecords: health[0].total,
        vaccinations: vaccs[0].total,
        medications: meds[0].total,
        users: users[0].total,
        upcomingAppointments: upcoming[0].total,
        completedAppointments: completed[0].total,
      },
      recentPets,
      recentAppointments: recentAppts,
    })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── PERFIL DE USUARIO ─────────────────────────────────────

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, phone, notes, createdAt FROM users ORDER BY id ASC LIMIT 1')
    if (rows.length === 0) return res.json(null)
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const r = req.body
    await pool.query(
      `UPDATE users SET name=?, email=?, phone=?, notes=? WHERE id=?`,
      [r.name, r.email, r.phone || null, r.notes || null, req.params.id]
    )
    const [rows] = await pool.query('SELECT id, name, email, role, phone, notes, createdAt FROM users WHERE id = ?', [req.params.id])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── INICIO ─────────────────────────────────────────────────

initDB()
  .then(() => {
    const serverIP = process.env.HOST_IP || getLocalIP()
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`  http://localhost:${PORT}`)
      console.log(` http://${serverIP}:${PORT}`)
    })
  })
  .catch(err => {
    console.error('Error crítico al iniciar:', err)
    process.exit(1)
  })