import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useRef, useEffect } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RADIUS, SPECIES_EMOJI } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

function FadeInView({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  )
}

function QuickTile({
  iconName, label, sublabel, accent, onPress, colors,
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name']
  label: string
  sublabel: string
  accent: string
  onPress: () => void
  colors: any
}) {
  const scale = useRef(new Animated.Value(1)).current

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      style={[styles.quickTile, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
    >
      <Animated.View style={{ transform: [{ scale }], gap: 6 }}>
        <View style={[styles.quickTileIcon, { backgroundColor: accent + '20' }]}>
          <Ionicons name={iconName} size={20} color={accent} />
        </View>
        <Text style={[styles.quickTileLabel, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.quickTileSub, { color: colors.textMuted }]}>{sublabel}</Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

function StatPill({
  value, label, color, icon, colors,
}: {
  value: number; label: string; color: string; icon: any; colors: any
}) {
  return (
    <View style={[styles.statPill, { backgroundColor: color + '12', borderColor: color + '25' }]}>
      <View style={[styles.statPillIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.statPillVal, { color }]}>{value}</Text>
      <Text style={[styles.statPillLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  )
}

export default function HomeScreen() {
  const { pets, appointments, loaded } = useApp()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments
    .filter((a: any) => a.status === 'scheduled' && a.date >= today)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const hour = new Date().getHours()
  const greetText = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const greetEmoji = hour < 12 ? '☀️' : hour < 18 ? '🌤' : '🌙'

  const upcomingCount = appointments.filter((a: any) => a.status === 'scheduled' && a.date >= today).length
  const completedCount = appointments.filter((a: any) => a.status === 'completed').length

  if (!loaded) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[styles.loadingPaw, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="paw" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Conectando con el servidor...</Text>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
      </View>
    )
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.glassBorder }]}>
        <View>
          <Text style={[styles.greet, { color: colors.textMuted }]}>
            {greetEmoji}  {greetText}
          </Text>
          <View style={styles.headerRow}>
            <Text style={[styles.brandName, { color: colors.textPrimary }]}>
              <Text style={{ color: colors.primary }}>P</Text>Vet
            </Text>
            <View style={[styles.brandBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}>
              <Ionicons name="paw" size={10} color={colors.primary} />
              <Text style={[styles.brandBadgeText, { color: colors.primary }]}>PRO</Text>
            </View>
          </View>
          <Text style={[styles.brandSub, { color: colors.textMuted }]}>Asistente Veterinario</Text>
        </View>

        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110, paddingTop: 8 }}
      >
        <FadeInView delay={0}>
          <View style={styles.heroSection}>
            <View style={[styles.heroBanner, { backgroundColor: colors.darkCard }]}>
              <View style={[styles.orb1, { backgroundColor: colors.primary + '22' }]} />
              <View style={[styles.orb2, { backgroundColor: '#FFD166' + '10' }]} />

              <View style={styles.heroContent}>
                <View>
                  <Text style={styles.heroLabel}>Bajo tu cuidado</Text>
                  <View style={styles.heroCountRow}>
                    <Text style={styles.heroCount}>{pets.length}</Text>
                    <Text style={styles.heroCountUnit}>
                      {pets.length === 1 ? 'mascota' : 'mascotas'}
                    </Text>
                  </View>
                  <View style={styles.heroDivider} />
                  <Text style={styles.heroClaim}>Todo bajo control ✓</Text>
                </View>

                {pets.length > 0 && (
                  <View style={styles.heroPets}>
                    {pets.slice(0, 3).map((p: any, i: number) => (
                      <View
                        key={p.id}
                        style={[
                          styles.heroPetChip,
                          { backgroundColor: (p.colorTheme || colors.primary) + '30',
                            borderColor: (p.colorTheme || colors.primary) + '50',
                            marginRight: i < Math.min(pets.length, 3) - 1 ? -6 : 0,
                            zIndex: 3 - i,
                          }
                        ]}
                      >
                        <Text style={{ fontSize: 16 }}>{SPECIES_EMOJI[(p.species || '') as keyof typeof SPECIES_EMOJI] || '🐾'}</Text>
                      </View>
                    ))}
                    {pets.length > 3 && (
                      <View style={[styles.heroPetMore, { backgroundColor: colors.primary + '25', borderColor: colors.primary + '40' }]}>
                        <Text style={[styles.heroPetMoreText, { color: colors.primary }]}>+{pets.length - 3}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <Ionicons name="paw" size={90} color="rgba(255,255,255,0.04)" style={styles.heroDecorPaw} />
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={100}>
          <View style={styles.statsStrip}>
            <StatPill value={pets.length} label="Mascotas" color={colors.primary} icon="paw-outline" colors={colors} />
            <View style={[styles.statsDivider, { backgroundColor: colors.glassBorder }]} />
            <StatPill value={upcomingCount} label="Próximas" color="#FFD166" icon="calendar-outline" colors={colors} />
            <View style={[styles.statsDivider, { backgroundColor: colors.glassBorder }]} />
            <StatPill value={completedCount} label="Completadas" color={colors.success} icon="checkmark-done-outline" colors={colors} />
          </View>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Accesos rápidos</Text>
            <View style={styles.quickGrid}>
              <QuickTile
                iconName="paw-outline"
                label="Mascotas"
                sublabel={`${pets.length} registradas`}
                accent={colors.primary}
                colors={colors}
                onPress={() => router.push('/(tabs)/pets')}
              />
              <QuickTile
                iconName="calendar-outline"
                label="Citas"
                sublabel={`${upcomingCount} próximas`}
                accent="#FFD166"
                colors={colors}
                onPress={() => router.push('/(tabs)/appointments')}
              />
              <QuickTile
                iconName="medkit-outline"
                label="Salud"
                sublabel="Cartilla"
                accent={colors.teal}
                colors={colors}
                onPress={() => router.push('/(tabs)/health')}
              />
              <QuickTile
                iconName="settings-outline"
                label="Config"
                sublabel="Ajustes"
                accent={colors.textMuted}
                colors={colors}
                onPress={() => router.push('/(tabs)/settings')}
              />
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Próximas citas</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas →</Text>
              </TouchableOpacity>
            </View>

            {upcoming.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '12' }]}>
                  <Ionicons name="calendar-outline" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin citas próximas</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No hay nada agendado por ahora
                </Text>
                <TouchableOpacity
                  style={[styles.emptyAction, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(tabs)/appointments')}
                >
                  <Text style={styles.emptyActionText}>Agendar cita</Text>
                </TouchableOpacity>
              </View>
            ) : (
              upcoming.map((a: any) => {
                const pet = pets.find((p: any) => p.id === a.petId)
                const d = a.date ? new Date(a.date + 'T00:00') : null
                const accent = pet?.colorTheme || colors.primary

                return (
                  <View
                    key={a.id}
                    style={[styles.apptCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
                  >
                    <View style={[styles.apptStripe, { backgroundColor: accent }]} />
                    <View style={[styles.apptDateBox, { backgroundColor: accent + '15' }]}>
                      <Text style={[styles.apptDateMonth, { color: accent }]}>
                        {d ? d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase() : '—'}
                      </Text>
                      <Text style={[styles.apptDateDay, { color: accent }]}>
                        {d ? d.getDate() : '—'}
                      </Text>
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.apptService, { color: colors.textPrimary }]} numberOfLines={1}>
                        {a.service}
                      </Text>
                      <View style={styles.apptMeta}>
                        <Text style={[styles.apptMetaText, { color: colors.textSecondary }]}>
                          {SPECIES_EMOJI[(pet?.species || '') as keyof typeof SPECIES_EMOJI] || '🐾'} {pet?.name || 'N/A'}
                        </Text>
                        <Text style={[styles.apptDot, { color: colors.textMuted }]}>·</Text>
                        <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                        <Text style={[styles.apptMetaText, { color: colors.textSecondary }]}>{a.time}</Text>
                      </View>
                      <View style={styles.apptMeta}>
                        <Ionicons name="person-outline" size={11} color={colors.textMuted} />
                        <Text style={[styles.apptMetaText, { color: colors.textMuted }]} numberOfLines={1}>{a.vet}</Text>
                      </View>
                    </View>

                    <View style={[styles.apptBadge, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.apptBadgeText, { color: colors.primary }]}>Prog.</Text>
                    </View>
                  </View>
                )
              })
            )}
          </View>
        </FadeInView>

        {pets.length > 0 && (
          <FadeInView delay={400}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Mis mascotas</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/pets')}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas →</Text>
                </TouchableOpacity>
              </View>

              {pets.slice(0, 3).map((pet: any) => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => router.push('/(tabs)/pets')}
                  activeOpacity={0.78}
                  style={[styles.petCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
                >
                  <View style={[styles.petEmoji, { backgroundColor: (pet.colorTheme || colors.primary) + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{SPECIES_EMOJI[(pet.species || '') as keyof typeof SPECIES_EMOJI] || '🐾'}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.petName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {pet.name}
                    </Text>
                    <Text style={[styles.petInfo, { color: colors.textSecondary }]} numberOfLines={1}>
                      {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                      {pet.age ? ` · ${pet.age} años` : ''}
                    </Text>
                  </View>

                  <View style={styles.petRight}>
                    <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </FadeInView>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loadingPaw: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 22, paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  greet:      { fontSize: 12, fontWeight: '500', letterSpacing: 0.2, marginBottom: 3 },
  headerRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandName:  { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  brandBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  brandBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  brandSub:   { fontSize: 11, marginTop: 2 },
  notifBtn:   { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  heroSection:   { paddingHorizontal: 20, marginTop: 18, marginBottom: 0 },
  heroBanner:    { borderRadius: RADIUS.lg, padding: 24, overflow: 'hidden', minHeight: 150 },
  orb1:          { position: 'absolute', right: -30, top: -30, width: 130, height: 130, borderRadius: 65 },
  orb2:          { position: 'absolute', left: -20, bottom: -20, width: 90, height: 90, borderRadius: 45 },
  heroContent:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroLabel:     { fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  heroCountRow:  { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  heroCount:     { fontSize: 52, fontWeight: '800', color: '#FFFFFF', lineHeight: 56, letterSpacing: -2 },
  heroCountUnit: { fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
  heroDivider:   { width: 32, height: 2, backgroundColor: 'rgba(255,122,47,0.6)', borderRadius: 1, marginVertical: 10 },
  heroClaim:     { fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.2 },
  heroPets:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  heroPetChip:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  heroPetMore:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginLeft: -6 },
  heroPetMoreText: { fontSize: 11, fontWeight: '700' },
  heroDecorPaw:  { position: 'absolute', right: 16, top: 16 },

  statsStrip: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 16, marginBottom: 8,
    gap: 0,
  },
  statsDivider: { width: 1, height: 28, marginHorizontal: 4 },
  statPill:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1 },
  statPillIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  statPillVal:  { fontSize: 15, fontWeight: '800', letterSpacing: -0.5 },
  statPillLabel:{ fontSize: 9, fontWeight: '600', marginTop: 1 },

  section:      { paddingHorizontal: 20, marginTop: 28 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  seeAll:       { fontSize: 13, fontWeight: '600' },
  quickGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickTile: {
    width: '47.5%', borderRadius: RADIUS.md, padding: 16,
    borderWidth: 1, gap: 6,
  },
  quickTileIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  quickTileLabel: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  quickTileSub: { fontSize: 11, fontWeight: '500' },
  quickTileArrow: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginTop: 4, alignSelf: 'flex-start' },

  emptyCard:    { alignItems: 'center', padding: 36, borderRadius: RADIUS.md, borderWidth: 1, gap: 8 },
  emptyIconBox: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle:   { fontSize: 16, fontWeight: '700' },
  emptyText:    { fontSize: 13, textAlign: 'center' },
  emptyAction:  { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 8 },
  emptyActionText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  apptCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 10,
    overflow: 'hidden', paddingRight: 14, paddingVertical: 14,
  },
  apptStripe:    { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  apptDateBox:   { width: 46, alignItems: 'center', borderRadius: 10, paddingVertical: 8 },
  apptDateMonth: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  apptDateDay:   { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  apptService:   { fontSize: 13, fontWeight: '700', letterSpacing: -0.1, marginBottom: 3 },
  apptMeta:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  apptMetaText:  { fontSize: 11 },
  apptDot:       { fontSize: 12 },
  apptBadge:     { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  apptBadgeText: { fontSize: 10, fontWeight: '700' },

  petCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8,
  },
  petEmoji:   { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  petName:    { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  petInfo:    { fontSize: 12 },
  petRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  petVaxChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  petVaxText: { fontSize: 11, fontWeight: '700' },
})
