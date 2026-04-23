const mysql = require('mysql2/promise');

const DB_HOST = '192.168.0.45';
const DB_PORT = 3306;
const DB_USER = 'root';
const DB_PASSWORD = 'Rinrin0013#';
const DB_NAME = 'pvet_db';

async function initDb() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
  await connection.execute(`USE ${DB_NAME}`);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS pets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      species VARCHAR(100),
      breed VARCHAR(100),
      age INT,
      weight DECIMAL(5,2),
      colorTheme VARCHAR(20) DEFAULT '#FF7A2F',
      microchip VARCHAR(100),
      ownerName VARCHAR(255),
      ownerPhone VARCHAR(50),
      notes TEXT,
      imageUri TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      petId INT NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      type VARCHAR(100),
      vetName VARCHAR(255),
      location VARCHAR(255),
      status VARCHAR(20) DEFAULT 'scheduled',
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS health_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      petId INT NOT NULL,
      date DATE NOT NULL,
      type VARCHAR(100) NOT NULL,
      description TEXT,
      weight DECIMAL(5,2),
      vetName VARCHAR(255),
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS vaccinations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      petId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      dateApplied DATE NOT NULL,
      nextDue DATE,
      vetName VARCHAR(255),
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS medications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      petId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      dosage VARCHAR(100),
      frequency VARCHAR(100),
      startDate DATE NOT NULL,
      endDate DATE,
      notes TEXT,
      active TINYINT DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Tablas creadas en MySQL');
  await connection.end();
}

initDb().catch(console.error);