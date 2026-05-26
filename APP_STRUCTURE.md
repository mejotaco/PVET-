# PVET - Estructura Completa de la App

> Documentación técnica de la arquitectura, componentes, pantallas y flujo de datos.

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Backend (API REST)](#2-backend-api-rest)
3. [Frontend (App Expo)](#3-frontend-app-expo)
4. [Contexto global (AppContext)](#4-contexto-global-appcontext)
5. [Cliente API (api.ts)](#5-cliente-api-apits)
6. [Sistema de temas (claro/oscuro)](#6-sistema-de-temas-clarooscuro)
7. [Componentes reutilizables](#7-componentes-reutilizables)
8. [Pantallas](#8-pantallas)
9. [Navegación](#9-navegación)
10. [Cómo crear una nueva pantalla](#10-cómo-crear-una-nueva-pantalla)
11. [Cómo crear un nuevo componente](#11-cómo-crear-un-nuevo-componente)
12. [Cómo agregar un nuevo endpoint](#12-cómo-agregar-un-nuevo-endpoint)
13. [Cómo agregar una nueva tabla en la BD](#13-cómo-agregar-una-nueva-tabla-en-la-bd)

---

## 1. Arquitectura general

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Expo)                    │
│  React Native + TypeScript + Expo Router             │
│                                                      │
│  app/          → Pantallas (file-based routing)      │
│  components/   → UI reutilizable                     │
│  context/      → Estado global (AppContext + API)    │
│  hooks/        → Custom hooks                        │
│  constants/    → Temas, colores, config              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (fetch)
                       ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND (Express)                   │
│  Node.js + Express + MySQL2                          │
│                                                      │
│  server.js     → API REST completa                   │
│  .env          → Config DB/puerto                    │
└──────────────────────┬──────────────────────────────┘
                       │ MySQL
                       ▼
              ┌────────────────┐
              │   MySQL DB     │
              │   pvet_db      │
              └────────────────┘
```

**Stack principal:**
- **Frontend:** React Native 0.81.5 + Expo SDK 54 + TypeScript
- **Backend:** Node.js + Express 4.18 + MySQL2
- **Navegación:** Expo Router 6 (file-based routing)
- **Estado global:** React Context API
- **Estilos:** StyleSheet dinámico con hook `useTheme()`

---

## 2. Backend (API REST)

### Archivo: `backend/server.js`

Un solo archivo con todo el backend: inicializa la BD, crea tablas y expone la API REST.

### Estructura del archivo

```
server.js
├── Config inicial (dotenv, express, cors, json)
├── getLocalIP() → detecta IP local
├── initDB() → crea BD + tablas + seed
│   ├── pets
│   ├── appointments
│   ├── health_records
│   ├── vaccinations
│   ├── medications
│   └── users (con seed: Juan García)
├── Endpoints (ordenados por entidad)
│   ├── GET /api/info
│   ├── MASCOTAS  (GET/POST/PUT/DELETE /api/pets)
│   ├── CITAS     (GET/POST/PATCH/DELETE /api/appointments)
│   ├── SALUD     (GET/POST/DELETE /api/health-records)
│   ├── VACUNAS   (GET/POST /api/vaccinations)
│   ├── MEDS      (GET/POST /api/medications, PATCH toggle)
│   └── USUARIO   (GET/PUT /api/users)
└── Inicio: initDB() → app.listen()
```

### Tablas de la BD

| Tabla | PK | FK | Columnas clave |
|-------|----|----|---------------|
| `pets` | id | — | name, species, breed, age, weight, colorTheme, microchip, ownerName, ownerPhone, notes, imageUri |
| `appointments` | id | petId → pets(id) | service, date, time, vet, location, status (ENUM), notes |
| `health_records` | id | petId → pets(id) | date, type, description, weight, vetName, notes |
| `vaccinations` | id | petId → pets(id) | name, dateApplied, nextDue, vetName, notes |
| `medications` | id | petId → pets(id) | name, dosage, frequency, startDate, endDate, active, notes |
| `users` | id | — | name, email, phone, notes |

### Convenciones de endpoints

- Todas las rutas empiezan con `/api/`
- Formato de respuesta: JSON
- Errores: `{ error: "mensaje" }` con status 500
- Las fechas se almacenan como strings `VARCHAR(10)` en formato `YYYY-MM-DD`
- Las horas como `VARCHAR(5)` en formato `HH:MM`

### Cómo agregar un endpoint

```javascript
// Ejemplo: agregar GET /api/users/profile
app.get('/api/users/profile', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [1])
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
```

---

## 3. Frontend (App Expo)

### Estructura de directorios

```
frontend/
├── app/                          # File-based routing (Expo Router)
│   ├── _layout.tsx               # Layout raíz (SafeArea + AppProvider + StatusBar)
│   └── (tabs)/                   # Grupo de tabs
│       ├── _layout.tsx           # Config del tab bar (5 pestañas)
│       ├── index.tsx             # Inicio / Dashboard
│       ├── pets.tsx              # Gestión de mascotas
│       ├── appointments.tsx      # Gestión de citas
│       ├── health.tsx            # Registros de salud
│       └── settings.tsx          # Configuración y perfil
│
├── components/                   # Componentes reutilizables
│   ├── Button.tsx                # Botón con variantes
│   ├── Card.tsx                  # Tarjeta con variantes
│   ├── FormField.tsx             # Campos de formulario (input, select, textarea)
│   ├── Modal.tsx                 # Modal genérico
│   ├── haptic-tab.tsx            # Tab item con feedback háptico
│   ├── themed-text.tsx           # Texto con tema
│   ├── themed-view.tsx           # View con tema
│   └── ui/
│       ├── collapsible.tsx       # Acordeón
│       └── icon-symbol.tsx       # Icono Ionicons
│
├── context/
│   ├── AppContext.tsx            # Estado global de la app
│   └── api.ts                    # Cliente HTTP (auto-descubrimiento de servidor)
│
├── hooks/
│   ├── useTheme.ts               # Hook principal de tema (claro/oscuro)
│   ├── use-theme-color.ts        # Helper para colores por tema
│   ├── use-color-scheme.ts       # Re-export de react-native
│   └── use-color-scheme.web.ts   # Versión web (hydration-safe)
│
├── constants/
│   └── theme.ts                  # Paletas LIGHT/DARK, RADIUS, FONTS, emojis, colores
│
└── assets/images/                # Imágenes (iconos, splash)
```

### Convenciones de código

- **Lenguaje:** TypeScript estricto
- **Estilos:** `StyleSheet.create()` con valores dinámicos del hook `useTheme()`
- **Nombres de archivos:** `pascal-case.tsx` para componentes, `camel-case.ts` para utilidades
- **Imports:** Orden: React → Librerías externas → Componentes internos → Constantes → Context → Hooks
- **Tema:** Nunca usar colores hardcodeados; siempre extraerlos de `useTheme()`

---

## 4. Contexto global (AppContext)

### Archivo: `frontend/context/AppContext.tsx`

Es el centro de datos de la app. Todo componente que necesite datos globales usa `useApp()`.

### Interfaces principales

```typescript
interface Pet {
  id: number; name: string; species: string | null; breed: string | null;
  age: number | null; weight: number | null; colorTheme: string;
  microchip: string | null; ownerName: string | null; ownerPhone: string | null;
  notes: string | null; imageUri: string | null; createdAt: string;
}

interface Appointment {
  id: number; petId: number; date: string; time: string;
  type: string | null; vetName: string | null; location: string | null;
  status: string; notes: string | null; createdAt: string;
}

interface UserProfile {
  id: number; name: string; email: string | null;
  phone: string | null; notes: string | null;
}

type ThemeMode = 'system' | 'light' | 'dark';
```

### Valores expuestos por `useApp()`

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `loaded` | boolean | Indica si los datos iniciales ya cargaron |
| `serverUrl` | string\|null | URL del backend detectada |
| `pets` | Pet[] | Lista de mascotas |
| `petVaccines` | Record<number, Vaccination[]> | Vacunas indexadas por petId |
| `appointments` | Appointment[] | Lista de citas |
| `notifications` | boolean | Preferencia de notificaciones |
| `user` | UserProfile\|null | Perfil del usuario |
| `themeMode` | ThemeMode | Modo de tema ('system', 'light', 'dark') |
| `addPet(pet)` | Promise | Crea una mascota |
| `updatePet(id, data)` | Promise | Actualiza una mascota |
| `deletePet(id)` | Promise | Elimina una mascota |
| `addAppointment(a)` | Promise | Crea una cita |
| `cancelAppointment(id)` | Promise | Cancela una cita |
| `toggleNotifications()` | void | Alterna notificaciones |
| `refresh()` | Promise | Recarga todos los datos |
| `updateProfile(data)` | Promise | Actualiza el perfil del usuario |
| `setThemeMode(mode)` | void | Cambia el modo de tema |

### Flujo de inicio

```
AppProvider monta
  → Carga themeMode desde AsyncStorage
  → api.discover() → detecta URL del backend
  → api.getProfile() → carga perfil del usuario
  → loadAllData():
       → api.getPets()
       → api.getAppointments()
       → api.getVaccinations() por cada mascota
  → loaded = true
```

### Cómo acceder al contexto

```typescript
import { useApp } from '../../context/AppContext'

function MiComponente() {
  const { pets, addPet, user } = useApp()
  // ...
}
```

---

## 5. Cliente API (api.ts)

### Archivo: `frontend/context/api.ts`

Singleton `APIClient` que maneja toda la comunicación HTTP con el backend.

### Características clave

- **Auto-descubrimiento:** Escanea `localhost` + subredes LAN comunes para encontrar el backend
- **Cache:** Guarda la URL exitosa en AsyncStorage
- **Timeout:** 3s por request, 2s por intento de descubrimiento
- **Batched discovery:** Prueba URLs en lotes de 50 concurrentemente

### Métodos disponibles

```typescript
// Descubrimiento
api.discover()                → Promise<string>  // Detecta y cachea URL
api.isConnected()             → Promise<boolean> // Verifica conexión
api.clearCachedUrl()          → Promise<void>    // Limpia cache

// Mascotas
api.getPets()                 → Promise<Pet[]>
api.createPet(data)           → Promise<Pet>
api.updatePet(id, data)       → Promise<Pet>
api.deletePet(id)             → Promise<void>

// Citas
api.getAppointments()         → Promise<Appointment[]>
api.getAppointmentsByPet(id)  → Promise<Appointment[]>
api.createAppointment(data)   → Promise<Appointment>
api.updateAppointment(id, d)  → Promise<Appointment>
api.cancelAppointment(id)     → Promise<Appointment>
api.deleteAppointment(id)     → Promise<void>

// Salud
api.getHealthRecords()        → Promise<any[]>
api.getHealthRecordsByPet(id) → Promise<any[]>
api.createHealthRecord(data)  → Promise<any>
api.deleteHealthRecord(id)    → Promise<void>

// Vacunas
api.getVaccinations(petId)    → Promise<any[]>
api.createVaccination(data)   → Promise<any>

// Medicamentos
api.getMedications(petId)     → Promise<any[]>
api.createMedication(data)    → Promise<any>
api.toggleMedication(id)      → Promise<any>

// Perfil
api.getProfile()              → Promise<UserProfile|null>
api.updateProfile(id, data)   → Promise<UserProfile>
```

### Cómo usar el API directamente

```typescript
import { api } from '../../context/api'

const data = await api.getPets()
const newPet = await api.createPet({ name: 'Firulais', species: 'Perro' })
```

**Nota:** Normalmente no necesitas llamar al API directamente. Usa los métodos de `useApp()` que ya sincronizan el estado global.

---

## 6. Sistema de temas (claro/oscuro)

### Archivos involucrados

| Archivo | Rol |
|---------|-----|
| `constants/theme.ts` | Define paletas `LIGHT` y `DARK` + constantes compartidas |
| `hooks/useTheme.ts` | Hook que resuelve el tema actual y devuelve `{ colors, isDark }` |
| `context/AppContext.tsx` | Almacena `themeMode` (system/light/dark) persistido en AsyncStorage |

### Cómo funciona

1. El usuario elige un modo en Settings (`setThemeMode('light')`)
2. Se guarda en AsyncStorage (clave `pvet_theme_mode`)
3. `useTheme()` lee `themeMode` del contexto
   - Si es `'system'` → usa `useColorScheme()` del dispositivo
   - Si es `'light'` o `'dark'` → fuerza ese tema
4. Devuelve el objeto `colors` correspondiente (LIGHT o DARK)

### Cómo usar el tema en un componente

```typescript
import { useTheme } from '../../hooks/useTheme'

function MiComponente() {
  const { colors, isDark } = useTheme()

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Hola</Text>
    </View>
  )
}
```

### Paleta de colores disponible

```typescript
colors.background       // Fondo principal
colors.surface          // Superficie de tarjetas
colors.primary          // Color principal (naranja)
colors.primaryDark      // Naranja oscuro
colors.primaryLight     // Naranja claro
colors.teal            // Verde azulado
colors.textPrimary     // Texto principal
colors.textSecondary   // Texto secundario
colors.textMuted       // Texto tenue
colors.glass           // Fondo semitransparente
colors.glassBorder     // Borde semitransparente
colors.success         // Verde éxito
colors.error           // Rojo error
colors.warning         // Amarillo advertencia
// ... más en theme.ts
```

### Constantes compartidas

```typescript
RADIUS.sm  // 10
RADIUS.md  // 16
RADIUS.lg  // 24
RADIUS.xl  // 40

SPECIES_EMOJI.Perro  // '🐕'
SPECIES_EMOJI.Gato   // '🐈'
// ... Ave, Conejo, Pez, Reptil, Gallina, Otro

PET_COLORS           // Array de 10 colores para elegir
SERVICE_COLORS       // Mapa de servicio → color
```

---

## 7. Componentes reutilizables

### Button (`components/Button.tsx`)

```typescript
<Button
  variant="primary" | "secondary" | "danger" | "ghost"
  size="sm" | "md" | "lg"
  disabled={boolean}
  onPress={fn}
>
  Texto o ReactNode
</Button>
```

- `primary`: Fondo naranja, texto blanco, sombra
- `secondary`: Fondo según tema, borde sutil
- `danger`: Fondo rojo translúcido, texto rojo
- `ghost`: Transparente, texto secundario

### Card (`components/Card.tsx`)

```typescript
<Card
  variant="default" | "elevated" | "glass" | "outline"
  glow={boolean}
  onPress={fn}
  style={}
>
  children
</Card>
```

- `default`: Fondo card, borde 1px, sombra sutil
- `elevated`: Fondo elevado, sombra fuerte
- `glass`: Fondo translúcido
- `outline`: Borde primary 1.5px, fondo transparente
- `glow`: Brillo primary alrededor

### FormField (`components/FormField.tsx`)

```typescript
<Field label="Nombre" required={true}>
  <FInput label="Nombre" value={v} onChangeText={setV} placeholder="..." />
  <FSelect label="Tipo" value={v} options={[{label, value}]} onChange={fn} />
  <FTextarea label="Notas" value={v} onChangeText={setV} />
</Field>
```

- `FInput`: Input con foco coloreado
- `FSelect`: Dropdown custom con scroll
- `FTextarea`: TextArea multilinea (4 líneas)

### Modal (`components/Modal.tsx`)

```typescript
<Modal isOpen={bool} onClose={fn} title="Título">
  contenido
</Modal>
```

Overlay oscuro con fade, header con título y botón X, contenido scrollable.

---

## 8. Pantallas

### 8.1 Home (`app/(tabs)/index.tsx`)

**Propósito:** Dashboard principal con resumen.
**Datos:** `pets`, `appointments`, `loaded` de `useApp()`.

**Secciones:**
- Header saludo según hora + campana notificaciones
- Hero banner con conteo de mascotas y emojis
- Stats: Mascotas / Próximas / Completadas
- Quick Access: 4 tiles (Mascotas, Citas, Salud, Config)
- Próximas citas (filtradas y ordenadas)
- Mis mascotas (primeras 3)

### 8.2 Pets (`app/(tabs)/pets.tsx`)

**Propósito:** CRUD completo de mascotas.
**Datos:** `pets` de `useApp()`.

**Funcionalidad:**
- Buscador por nombre/especie
- Lista de tarjetas con emoji, nombre, especie, chips
- Modal de detalle (info + editar/eliminar)
- Modal de crear/editar (formulario con todos los campos)
- Selector de color (10 colores)
- Eliminación con confirmación

### 8.3 Appointments (`app/(tabs)/appointments.tsx`)

**Propósito:** CRUD de citas.
**Datos:** `appointments`, `pets` de `useApp()`.

**Funcionalidad:**
- Filtros horizontales: Todas, Próximas, Pasadas, Canceladas
- Mini stats: Total / Próximas / Completadas
- Tarjetas con fecha, servicio, mascota, hora, vet, estado
- Modal de nueva cita (pet select, servicio, fecha, hora, vet, notas)
- Cancelar cita con confirmación

### 8.4 Health (`app/(tabs)/health.tsx`)

**Propósito:** Registros de salud y vacunas por mascota.
**Datos:** `pets` de `useApp()`, llama a `api` directamente.

**Funcionalidad:**
- Selector de mascota (tarjetas con emoji)
- Lista de vacunas con indicador de vencimiento
- Lista de documentos/registros de salud
- Modal de agregar vacuna (tipo, fecha, próximo vencimiento, vet)
- Modal de agregar documento (tipo, descripción, fecha, vet)

### 8.5 Settings (`app/(tabs)/settings.tsx`)

**Propósito:** Configuración general y perfil.
**Datos:** Todo el contexto.

**Secciones:**
- **Perfil:** Avatar con inicial, nombre, email → modal de edición
- **Stats:** Mascotas / Total Citas / Próximas
- **Notificaciones:** 4 switches (recordatorios, email, push, vacunas)
- **Apariencia:** 3 switches (Modo claro, Modo oscuro, Modo sistema)
- **Cuenta:** Exportar datos, Limpiar datos, Probar conexión
- **Acerca de:** Logo, versión, descripción

---

## 9. Navegación

### Expo Router (file-based routing)

```
app/
├── _layout.tsx        → Stack navigator (raíz)
└── (tabs)/
    ├── _layout.tsx    → Tab navigator (5 pestañas)
    ├── index.tsx      → /
    ├── pets.tsx       → /pets
    ├── appointments   → /appointments
    ├── health.tsx     → /health
    └── settings.tsx   → /settings
```

### Root layout (`app/_layout.tsx`)

```typescript
<SafeAreaProvider>
  <AppProvider>
    <RootContent>   ← usa useTheme() para colors + StatusBar
      <StatusBar />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </RootContent>
  </AppProvider>
</SafeAreaProvider>
```

### Tab layout (`app/(tabs)/_layout.tsx`)

- 5 tabs con iconos Ionicons
- Tab bar flotante (absolute, borderRadius 28)
- Animación de escala al enfocar
- Sin labels visibles
- Adaptable a tema oscuro/claro

### Cómo navegar entre pantallas

```typescript
import { useRouter } from 'expo-router'

const router = useRouter()
router.push('/(tabs)/pets')       // Navegar a Pets
router.push('/(tabs)/settings')   // Navegar a Settings
router.back()                     // Volver
```

**Nota:** Actualmente todas las pantallas están en tabs. No hay navegación stack anidada. Si necesitas una pantalla que no sea tab (ej. una pantalla de detalle), créala fuera de `(tabs)/`:

```
app/
├── details.tsx  → /details
└── (tabs)/
    └── ...
```

---

## 10. Cómo crear una nueva pantalla

### Paso 1: Crear el archivo

Si es un tab, dentro de `app/(tabs)/`:
```
app/(tabs)/mipantalla.tsx
```

Si NO es un tab, dentro de `app/`:
```
app/mipantalla.tsx
```

### Paso 2: Estructura base

```typescript
import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import { useApp } from '../../context/AppContext'

export default function MiPantalla() {
  const { colors } = useTheme()
  const { pets } = useApp()

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.textPrimary }}>Mi Pantalla</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
})
```

### Paso 3: Agregar al tab (si aplica)

Si es un tab, editar `app/(tabs)/_layout.tsx`:

```typescript
const TAB_CONFIG = [
  // ... tabs existentes
  { name: 'mipantalla', icon: 'star', iconOut: 'star-outline', label: 'Nuevo' },
]
```

Y en el array `<Tabs>` se agregará automáticamente porque Expo Router lee el filesystem.

### Paso 4: Navegar a la pantalla

```typescript
router.push('/(tabs)/mipantalla')
```

**Reglas:**
- Siempre usar `useTheme()` para los colores
- Usar `useApp()` para datos globales
- Para operaciones CRUD, usar los métodos del contexto (`addPet`, etc.)
- Los modals (crear/editar) deben ir en la misma pantalla, no como pantallas separadas

---

## 11. Cómo crear un nuevo componente

### Paso 1: Crear archivo en `components/`

```
components/MiComponente.tsx
```

### Paso 2: Estructura base

```typescript
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { RADIUS } from '../constants/theme'
import { useTheme } from '../hooks/useTheme'

interface MiComponenteProps {
  titulo: string
  onPress?: () => void
  // ... más props
}

export default function MiComponente({ titulo, onPress }: MiComponenteProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
      <Text style={{ color: colors.textPrimary }}>{titulo}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
})
```

### Reglas para componentes

- Aceptar `colors` como prop O usar `useTheme()` internamente
- Si el componente necesita ser flexible, pasar `colors` como prop
- Usar `RADIUS` de `constants/theme` para bordes consistentes
- No usar valores numéricos mágicos; definir en `StyleSheet`
- Tipar todas las props con TypeScript (`interface`)

---

## 12. Cómo agregar un nuevo endpoint

### Backend: en `server.js`

```javascript
// Ubicar en la sección correspondiente
// ─── NUEVA ENTIDAD ─────────────────────────────────────

app.get('/api/nuevo', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM nueva_tabla')
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/nuevo', async (req, res) => {
  try {
    const r = req.body
    const [result] = await pool.query(
      'INSERT INTO nueva_tabla (campo1, campo2) VALUES (?, ?)',
      [r.campo1, r.campo2]
    )
    const [rows] = await pool.query('SELECT * FROM nueva_tabla WHERE id = ?', [result.insertId])
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})
```

### Frontend: en `api.ts`

```typescript
// ─── Nueva entidad ─────────────────────────────────────

async getNuevo() {
  return this.request<any[]>('/api/nuevo')
}

async createNuevo(data: any) {
  return this.request<any>('/api/nuevo', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

### Frontend: en `AppContext.tsx`

```typescript
// Estado
const [nuevos, setNuevos] = useState<any[]>([])

// En loadAllData()
const fetchedNuevos = await api.getNuevo()
setNuevos(fetchedNuevos)

// Método
const addNuevo = async (data: any) => {
  const created = await api.createNuevo(data)
  setNuevos(prev => [created, ...prev])
}

// En el Provider value
value={{ ..., nuevos, addNuevo }}
```

---

## 13. Cómo agregar una nueva tabla en la BD

### En `backend/server.js`, dentro de `initDB()`:

```javascript
await conn.query(`
  CREATE TABLE IF NOT EXISTS nueva_tabla (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    petId       INT,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha       VARCHAR(10),
    activo      TINYINT(1)   DEFAULT 1,
    createdAt   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (petId) REFERENCES pets(id) ON DELETE SET NULL
  ) ENGINE=InnoDB
`)
```

### Convenciones de tablas

- `id` → INT AUTO_INCREMENT PRIMARY KEY
- `createdAt` → DATETIME DEFAULT CURRENT_TIMESTAMP
- Fechas → VARCHAR(10) en formato `YYYY-MM-DD`
- Textos largos → TEXT
- Valores booleanos → TINYINT(1)
- Llaves foráneas → `ON DELETE SET NULL` (para no perder datos al eliminar)
- Engine → InnoDB (soporta FK)

---

## Flujo de datos típico (ej: crear mascota)

```
Usuario presiona "Guardar" en modal de Pets
  → pets.tsx: handleSubmit()
    → addPet(formData)   [useApp()]
      → AppContext: addPet()
        → api.createPet(formData)   [api.ts]
          → fetch POST /api/pets    [HTTP]
            → server.js: app.post('/api/pets')
              → INSERT INTO pets ...
              → SELECT * FROM pets WHERE id = ?
              → res.json(newPet)
          ← newPet
        → setPets(prev => [newPet, ...prev])
      ← (contexto actualizado)
    ← (pantalla se re-renderiza con la nueva mascota)
```

---

## Comandos útiles

```bash
# Frontend
cd frontend
npx expo start              # Iniciar Metro Bundler
npx expo start --web        # Iniciar en web
npx expo start --android    # En Android
npx expo start --ios        # En iOS

# Backend
cd backend
npm start                   # Iniciar servidor
npm run dev                 # Iniciar con nodemon (hot-reload)
```

---

## Dependencias principales

| Frontend | Backend |
|----------|---------|
| expo ~54.0.0 | express 4.18 |
| react-native 0.81.5 | mysql2 3.9 |
| expo-router 6.0 | cors 2.8 |
| @react-native-async-storage/async-storage | dotenv 17.4 |
| expo-haptics | nodemon 3.1 (dev) |
| expo-status-bar | |
| react-native-safe-area-context | |
| react-native-screens | |
