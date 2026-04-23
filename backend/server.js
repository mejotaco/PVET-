require('dotenv').config()

const express = require('express')
const mysql   = require('mysql2/promise')
const cors    = require('cors')
const os      = require('os')

const app = express()
app.use(cors())
app.use(express.json())

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
        createdAt   DATETIME     DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `)

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

    console.log('✅ Base de datos pvet_db lista')
  } catch (err) {
    console.error('❌ Error en initDB:', err)
    throw err
  } finally {
    if (conn) conn.release()
  }
}

// ─── MASCOTAS ───────────────────────────────────────────────

app.get('/api/pets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pets ORDER BY id DESC')
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/pets', async (req, res) => {
  try {
    const r = req.body
    const [result] = await pool.query(
      `INSERT INTO pets (name, species, breed, age, weight, colorTheme, microchip, ownerName, ownerPhone, notes, imageUri)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.name, r.species, r.breed, r.age, r.weight, r.colorTheme, r.microchip, r.ownerName, r.ownerPhone, r.notes, r.imageUri]
    )
    const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/pets/:id', async (req, res) => {
  try {
    const r = req.body
    await pool.query(
      `UPDATE pets SET name=?, species=?, breed=?, age=?, weight=?, colorTheme=?, microchip=?, ownerName=?, ownerPhone=?, notes=?, imageUri=? WHERE id=?`,
      [r.name, r.species, r.breed, r.age, r.weight, r.colorTheme, r.microchip, r.ownerName, r.ownerPhone, r.notes, r.imageUri, req.params.id]
    )
    const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [req.params.id])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/pets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pets WHERE id=?', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── CITAS ──────────────────────────────────────────────────

app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments ORDER BY date DESC, time DESC')
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/appointments/pet/:petId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE petId = ? ORDER BY date DESC, time DESC', [req.params.petId])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/appointments', async (req, res) => {
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

app.patch('/api/appointments/:id', async (req, res) => {
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

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id=?', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── SALUD ───────────────────────────────────────────────────

app.get('/api/health-records', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_records ORDER BY date DESC')
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/health-records/pet/:petId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_records WHERE petId = ? ORDER BY date DESC', [req.params.petId])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/health-records', async (req, res) => {
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

app.delete('/api/health-records/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM health_records WHERE id=?', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── VACUNAS ────────────────────────────────────────────────

app.get('/api/vaccinations/pet/:petId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vaccinations WHERE petId = ? ORDER BY dateApplied DESC', [req.params.petId])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/vaccinations', async (req, res) => {
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

app.get('/api/medications/pet/:petId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medications WHERE petId = ? ORDER BY startDate DESC', [req.params.petId])
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/medications', async (req, res) => {
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

app.patch('/api/medications/:id/toggle', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT active FROM medications WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    const newActive = rows[0].active ? 0 : 1
    await pool.query('UPDATE medications SET active = ? WHERE id = ?', [newActive, req.params.id])
    const [updated] = await pool.query('SELECT * FROM medications WHERE id = ?', [req.params.id])
    res.json(updated[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ─── INICIO ─────────────────────────────────────────────────

initDB()
  .then(() => {
    const serverIP = process.env.HOST_IP || getLocalIP()
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API en http://localhost:${PORT}`)
      console.log(`📱 Accede desde la red: http://${serverIP}:${PORT}`)
    })
  })
  .catch(err => {
    console.error('Error crítico al iniciar:', err)
    process.exit(1)
  })