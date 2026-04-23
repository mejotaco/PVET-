-- Este comando debe ejecutarse en el servidor MySQL (192.168.0.45)
-- Crear usuario y dar permisos para conectar desde cualquier host

CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- O si quieres restrict solo a tu red local:
-- CREATE USER IF NOT EXISTS 'root'@'192.168.0.%' IDENTIFIED BY 'Rinrin0013#';
-- GRANT ALL PRIVILEGES ON pvet_db.* TO 'root'@'192.168.0.%';
-- FLUSH PRIVILEGES;
