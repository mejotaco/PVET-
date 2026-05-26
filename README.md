# PVET - Gestión Veterinaria

App móvil para gestionar mascotas, citas y salud veterinaria.

## Estructura

```
pvet-app/
├── backend/       # API REST Node.js + Express + MySQL
│   ├── server.js  # Punto de entrada con todas las rutas
│   ├── .env       # Variables de entorno (DB, puerto)
│   └── ...
└── frontend/       # App Expo (React Native) + Expo Router
    ├── app/        # Pantallas (router basado en archivos)
    ├── components/ # Componentes reutilizables
    ├── context/    # Contextos de React
    ├── constants/  # Constantes y configuración
    └── ...
```

## Requisitos

- **Node.js** >= 18
- **MySQL** (local o remoto)
- **Expo Go** en tu móvil (iOS/Android)
- **Windows Terminal** (recomendado) o CMD

## Backend

API REST en `http://localhost:4000`. Todas las rutas empiezan con `/api`.

### Configuración

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tus datos:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=tu_contraseña
PORT=4000
```

### Instalación y ejecución

```bash
cd backend
npm install
npm start
```

El backend crea automáticamente la base de datos `pvet_db` y sus tablas.

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/info` | Info del servidor (IP, puerto) |
| **Mascotas** | | |
| GET | `/api/pets` | Listar todas las mascotas |
| POST | `/api/pets` | Crear mascota |
| PUT | `/api/pets/:id` | Actualizar mascota |
| DELETE | `/api/pets/:id` | Eliminar mascota |
| **Citas** | | |
| GET | `/api/appointments` | Listar todas las citas |
| GET | `/api/appointments/pet/:petId` | Citas de una mascota |
| POST | `/api/appointments` | Crear cita |
| PATCH | `/api/appointments/:id` | Actualizar cita |
| DELETE | `/api/appointments/:id` | Eliminar cita |
| **Salud** | | |
| GET | `/api/health-records` | Listar registros de salud |
| GET | `/api/health-records/pet/:petId` | Registros de una mascota |
| POST | `/api/health-records` | Crear registro |
| DELETE | `/api/health-records/:id` | Eliminar registro |
| **Vacunas** | | |
| GET | `/api/vaccinations/pet/:petId` | Vacunas de una mascota |
| POST | `/api/vaccinations` | Registrar vacuna |
| **Medicamentos** | | |
| GET | `/api/medications/pet/:petId` | Medicamentos de una mascota |
| POST | `/api/medications` | Registrar medicamento |
| PATCH | `/api/medications/:id/toggle` | Activar/desactivar medicamento |

## Frontend

App Expo con navegación por tabs.

### Instalación y ejecución

```bash
cd frontend
npm install
npx expo start
```

Esto abre Metro Bundler. Escanea el QR con Expo Go en tu móvil.

### Solución: QR no se ve en terminal

Si el QR se ve como caracteres extraños (`🬕🬰🬰🬒...`):

1. **Usa Windows Terminal** (recomendado) desde Microsoft Store
2. Presiona **`d`** en la terminal para abrir Expo Developer Tools en el navegador y escanea el QR desde ahí
3. Presiona **`w`** para abrir versión web
4. Usa `--tunnel` si estás en otra red: `npx expo start --tunnel`

### Variables de entorno del frontend

El frontend usa un archivo `.env` o `.env.local` para configurar la IP del backend:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
```

Si no se define, usa `localhost:4000` por defecto.

## Tablas de la base de datos

El backend crea automáticamente en `pvet_db`:

- **pets** - Mascotas
- **appointments** - Citas veterinarias
- **health_records** - Registros de salud
- **vaccinations** - Vacunas
- **medications** - Medicamentos

## Actualización de paquetes

Para sincronizar las versiones con el SDK de Expo:

```bash
cd frontend
npx expo install --fix
```

Si algo falla, revertir:

```bash
git checkout -- package.json
npm install
```
