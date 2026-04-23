const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Rinrin0013#'
  });

  await conn.query('DROP DATABASE IF EXISTS pvet_db');
  await conn.query('CREATE DATABASE pvet_db');
  await conn.query(`CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'Rinrin0013#'`);
  await conn.query(`GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION`);
  await conn.query('FLUSH PRIVILEGES');

  await conn.changeUser({ database: 'pvet_db' });

  await conn.query(`
    CREATE TABLE pets (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
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

  await conn.query(`
    CREATE TABLE appointments (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      petId INT UNSIGNED NOT NULL,
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

  await conn.query(`
    CREATE TABLE health_records (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      petId INT UNSIGNED NOT NULL,
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

  await conn.query(`
    CREATE TABLE vaccinations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      petId INT UNSIGNED NOT NULL,
      name VARCHAR(255) NOT NULL,
      dateApplied DATE NOT NULL,
      nextDue DATE,
      vetName VARCHAR(255),
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE medications (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      petId INT UNSIGNED NOT NULL,
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

  console.log('Tablas MySQL creadas');
  await conn.end();
}

main().catch(console.error);