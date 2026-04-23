import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { RADIUS, SPECIES_EMOJI } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

const TABS = ['Inicio', 'Estadísticas', 'Historial']

// ── Quick access card ────────────────────────────────────────────────────────
function QuickAccess({
  iconName, label, bg, onPress,
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name']
  label: string
  bg: string
  onPress: () => void
}) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.quickCard, { backgroundColor: bg }]}
      activeOpacity={0.78}
    >
      <Ionicons name={iconName} size={22} color={colors.textSecondary} />
      <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  iconName, value, label, color, colors,
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name']
  value: number
  label: string
  color: string
  colors: any
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
      <Ionicons name={iconName} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { pets, appointments } = useApp()
  const { colors } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments
    .filter((a: any) => a.status === 'scheduled' && a.date >= today)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(0, 3)

  const hour = new Date().getHours()
  const greetText =
    hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const totalVaccines = pets.reduce(
    (acc: number, p: any) => acc + (p.vaccines?.length || 0),
    0,
  )

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.glassBorder }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="paw" size={20} color="#fff" />
          </View>
          <View>
            <Text style={[styles.greet, { color: colors.textSecondary }]}>{greetText}</Text>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>PVet</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>Asistente Veterinario</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.background }]}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(i)}
            style={[
              styles.tab,
              activeTab === i && { backgroundColor: colors.textPrimary },
            ]}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === i ? colors.background : colors.textMuted },
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >

        {/* ── Hero card ──────────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <View style={[styles.darkCard, { backgroundColor: colors.darkCard }]}>
            <View style={styles.darkCardOrb} />

            <Text style={styles.darkCardSub}>Mascotas registradas</Text>
            <Text style={styles.darkCardStat}>{pets.length}</Text>

            <View style={styles.darkCardFooter}>
              <View style={[styles.darkBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.darkBadgeText}>PVet</Text>
              </View>
              <Text style={styles.darkCardClaim}>Asistente Veterinario</Text>
            </View>

            {/* Decorative icon — absolute, right side */}
            <View style={styles.darkCardDecor} pointerEvents="none">
              <Ionicons name="paw" size={64} color="rgba(255,255,255,0.06)" />
            </View>
          </View>
        </View>

        {/* ── Quick access ───────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Accesos rápidos</Text>
          <View style={styles.quickRow}>
            <QuickAccess
              iconName="paw-outline"
              label="Mascotas"
              bg={colors.quickPets}
              onPress={() => router.push('/(tabs)/pets')}
            />
            <QuickAccess
              iconName="calendar-outline"
              label="Citas"
              bg={colors.quickAppointments}
              onPress={() => router.push('/(tabs)/appointments')}
            />
          </View>
        </View>

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Resumen</Text>
          <View style={styles.statsRow}>
            <StatCard
              iconName="paw-outline"
              value={pets.length}
              label="Mascotas"
              color={colors.primary}
              colors={colors}
            />
            <StatCard
              iconName="calendar-outline"
              value={upcoming.length}
              label="Citas"
              color={colors.amber}
              colors={colors}
            />
            <StatCard
              iconName="shield-checkmark-outline"
              value={totalVaccines}
              label="Vacunas"
              color={colors.success}
              colors={colors}
            />
          </View>
        </View>

        {/* ── Upcoming appointments ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Próximas citas</Text>

          {upcoming.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
              <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin citas próximas</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay citas agendadas
              </Text>
              <Button
                onPress={() => router.push('/(tabs)/appointments')}
                size="sm"
                style={{ marginTop: 16 }}
              >
                Agendar cita
              </Button>
            </View>
          ) : upcoming.map((a: any) => {
            const pet = pets.find((p: any) => p.id === a.petId)
            const d = a.date ? new Date(a.date + 'T00:00') : null

            return (
              <View
                key={a.id}
                style={[styles.apptCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
              >
                <View style={[styles.apptAccent, { backgroundColor: colors.primary }]} />

                <View style={[styles.dateBox, { backgroundColor: colors.quickAppointments, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.dateMonth, { color: colors.primary }]}>
                    {d ? d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase() : '—'}
                  </Text>
                  <Text style={[styles.dateDay, { color: colors.primary }]}>
                    {d ? d.getDate() : '—'}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.apptService, { color: colors.textPrimary }]} numberOfLines={1}>
                    {a.service}
                  </Text>
                  <View style={styles.apptMetaRow}>
                    <Text style={[styles.apptMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                      {SPECIES_EMOJI[pet?.species] || ''} {pet?.name || 'N/A'}
                    </Text>
                    <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
                    <Text style={[styles.apptMeta, { color: colors.textSecondary }]}>{a.time}</Text>
                  </View>
                </View>

                <View style={[styles.badge, { backgroundColor: colors.quickPets }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>Programada</Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* ── Pets ───────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Mis mascotas</Text>

          {pets.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
              <Ionicons name="paw-outline" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin mascotas</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aún no has registrado mascotas
              </Text>
              <Button
                onPress={() => router.push('/(tabs)/pets')}
                size="sm"
                style={{ marginTop: 16 }}
              >
                Registrar mascota
              </Button>
            </View>
          ) : pets.slice(0, 3).map((pet: any) => (
            <TouchableOpacity
              key={pet.id}
              onPress={() => router.push('/(tabs)/pets')}
              style={[styles.petCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
              activeOpacity={0.78}
            >
              <View style={[styles.petAvatar, { backgroundColor: (pet.colorTheme || colors.primary) + '20' }]}>
                <Text style={{ fontSize: 22 }}>{SPECIES_EMOJI[pet.species] || '🐾'}</Text>
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.petName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {pet.name}
                </Text>
                <Text style={[styles.petBreed, { color: colors.textSecondary }]} numberOfLines={1}>
                  {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                </Text>
              </View>

              <View style={styles.petAgeContainer}>
                <Text style={[styles.petAge, { color: colors.textMuted }]}>
                  {pet.age} {pet.age === 1 ? 'año' : 'años'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}

          {pets.length > 3 && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/pets')}
              style={[styles.seeAllBtn, { borderColor: colors.glassBorder }]}
            >
              <Text style={[styles.seeAllText, { color: colors.textSecondary }]}>
                Ver todas ({pets.length})
              </Text>
              <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greet:       { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  headerSub:   { fontSize: 11, fontWeight: '400' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },

  // Hero
  heroSection: { paddingHorizontal: 20, marginTop: 16, marginBottom: 4 },
  darkCard: {
    borderRadius: RADIUS.lg,
    padding: 22,
    overflow: 'hidden',
    minHeight: 130,
  },
  darkCardOrb: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,122,47,0.12)',
  },
  darkCardSub:  { fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3, marginBottom: 4 },
  darkCardStat: { fontSize: 44, fontWeight: '700', color: '#FFFFFF', lineHeight: 48, letterSpacing: -1 },
  darkCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  darkBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 5,
  },
  darkBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
  darkCardClaim: { fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.2 },
  darkCardDecor: { position: 'absolute', right: 18, bottom: 14 },

  // Sections
  section:      { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, letterSpacing: -0.1 },

  // Quick access
  quickRow:  { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 7,
  },
  quickLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', letterSpacing: 0.1 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 3,
  },
  statValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, textAlign: 'center', fontWeight: '500' },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    padding: 36,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  emptyText:  { fontSize: 13 },

  // Appointment card
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    overflow: 'hidden',
  },
  apptAccent: { width: 3, alignSelf: 'stretch' },
  dateBox: {
    width: 48,
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    marginVertical: 10,
  },
  dateMonth: { fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  dateDay:   { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  apptService: { fontWeight: '700', fontSize: 13, letterSpacing: -0.1, marginBottom: 2 },
  apptMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  apptMeta:    { fontSize: 12 },
  dot:         { fontSize: 12 },
  badge: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 12,
  },
  badgeText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },

  // Pet card
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petName:  { fontWeight: '700', fontSize: 14, letterSpacing: -0.1 },
  petBreed: { fontSize: 12, marginTop: 1 },
  petAgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  petAge: { fontSize: 12, fontWeight: '500' },

  // See all
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
  seeAllText: { fontSize: 13, fontWeight: '600' },
})