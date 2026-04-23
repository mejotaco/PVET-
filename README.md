# PVET - Gestión Veterinaria

App móvil para gestionar mascotas, citas y salud veterinaria.

## Estructura

```
pvet-app/
├── backend/       # API Node.js + Express + MySQL
└── frontend/       # App Expo + React Native
```

## Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tu configuración de MySQL
npm install
npm start
```

## Frontend

```bash
cd frontend
npm install
npx expo start
```

## Configuración

- El backend crea automáticamente la base de datos `pvet_db` en MySQL
- El frontend se conecta automáticamente al backend en la red local