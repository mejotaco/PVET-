// constants/theme.ts

export const LIGHT = {
  // Fondos
  background: '#F7F7F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',

  // Acento naranja
  primary: '#FF7A2F',
  primaryDark: '#D95A10',
  primaryLight: '#FFB347',

  // Alias
  teal: '#FF7A2F',
  tealDark: '#D95A10',
  tealLight: '#FFB347',

  coral: '#FF9A6C',
  amber: '#FFD166',

  // Textos
  textPrimary: '#0D0D0D',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Bordes y glass
  glass: 'rgba(0,0,0,0.03)',
  glassBorder: 'rgba(0,0,0,0.08)',

  // Cards de acceso rápido (pastel)
  quickPets: '#E8F5F0',
  quickAppointments: '#EEE8F5',
  quickHistory: '#FFF0EE',

  // Estados
  success: '#22C55E',
  error: '#EF4444',
  warning: '#FFD166',

  // Nav
  navBackground: '#FFFFFF',
  navBorder: 'rgba(0,0,0,0.06)',

  // Dark card (como en la referencia)
  darkCard: '#1A1A2E',
  darkCardText: '#FFFFFF',
}

export const DARK = {
  background: '#0D1117',
  surface: '#161B25',
  surfaceElevated: '#1E2535',
  card: '#1E2535',

  primary: '#FF7A2F',
  primaryDark: '#D95A10',
  primaryLight: '#FFB347',

  teal: '#FF7A2F',
  tealDark: '#D95A10',
  tealLight: '#FFB347',

  coral: '#FF9A6C',
  amber: '#FFD166',

  textPrimary: '#F5F0EB',
  textSecondary: '#9AA5B8',
  textMuted: '#4E5A6E',

  glass: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.08)',

  quickPets: 'rgba(34,197,94,0.12)',
  quickAppointments: 'rgba(167,139,250,0.12)',
  quickHistory: 'rgba(255,122,47,0.12)',

  success: '#22C55E',
  error: '#EF4444',
  warning: '#FFD166',

  navBackground: '#161B25',
  navBorder: 'rgba(255,255,255,0.06)',

  darkCard: '#0D0D0D',
  darkCardText: '#FFFFFF',
}

// Por ahora exportamos LIGHT como default
// Después conectamos con el contexto
export const COLORS = LIGHT

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 40,
}

export const FONTS = {
  display: 'System',
  body: 'System',
}

export const SPECIES_EMOJI: Record<string, string> = {
  Perro: '🐕',
  Gato: '🐈',
  Ave: '🦜',
  Conejo: '🐇',
  Pez: '🐟',
  Reptil: '🦎',
  Gallina: '🐔',
  Otro: '🐾',
}

export const PET_COLORS = [
  '#FF7A2F', // naranja
  '#FFD166', // amarillo
  '#4ADE80', // verde
  '#60A5FA', // azul
  '#F472B6', // rosa
  '#A78BFA', // lavanda
  '#F87171', // rojo suave
  '#34D399', // menta
  '#FBBF24', // ámbar
  '#818CF8', // índigo
]