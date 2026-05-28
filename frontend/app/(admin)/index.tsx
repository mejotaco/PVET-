import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RADIUS } from '../../constants/theme'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { api } from '../../context/api'

interface AdminStats {
  counts: {
    pets: number
    appointments: number
    healthRecords: number
    vaccinations: number
    medications: number
    users: number
    upcomingAppointments: number
    completedAppointments: number
  }
  recentPets: { id: number; name: string; species: string; createdAt: string }[]
  recentAppointments: { id: number; service: string; date: string; time: string; status: string; petName: string }[]
}

export default function AdminDashboard() {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminStats()
      setStats(data)
    } catch {
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    { value: stats.counts.pets, label: 'Mascotas', icon: 'paw-outline', color: colors.primary, route: '/(admin)/pets' },
    { value: stats.counts.appointments, label: 'Citas totales', icon: 'calendar-outline', color: '#FFD166', route: '/(admin)/appointments' },
    { value: stats.counts.upcomingAppointments, label: 'Próximas', icon: 'time-outline', color: colors.success, route: '/(admin)/appointments' },
    { value: stats.counts.vaccinations, label: 'Vacunas', icon: 'shield-checkmark-outline', color: colors.teal, route: '/(admin)/health' },
  ] : []

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.glassBorder }]}>
        <View>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Panel de Administración</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Bienvenido, {user?.name?.split(' ')[0]}
          </Text>
        </View>
        <TouchableOpacity
          onPress={logout}
          style={[styles.logoutBtn, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Cargando estadísticas...</Text>
          </View>
        ) : stats ? (
          <>
            <View style={styles.statsGrid}>
              {statCards.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => router.push(s.route as any)}
                  style={[styles.statCard, { backgroundColor: s.color + '10', borderColor: s.color + '20' }]}
                  activeOpacity={0.7}
                >
                  <Ionicons name={s.icon as any} size={20} color={s.color} />
                  <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Mascotas recientes</Text>
              {stats.recentPets.map(pet => (
                <View key={pet.id} style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <View style={[styles.recentIcon, { backgroundColor: colors.primary + '18' }]}>
                    <Ionicons name="paw-outline" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentName, { color: colors.textPrimary }]}>{pet.name}</Text>
                    <Text style={[styles.recentMeta, { color: colors.textMuted }]}>{pet.species || 'Sin especificar'}</Text>
                  </View>
                </View>
              ))}
              {stats.recentPets.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin mascotas registradas</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Citas recientes</Text>
              {stats.recentAppointments.map(a => (
                <View key={a.id} style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <View style={[styles.recentIcon, { backgroundColor: '#FFD16618' }]}>
                    <Ionicons name="calendar-outline" size={16} color="#FFD166" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentName, { color: colors.textPrimary }]}>{a.service}</Text>
                    <Text style={[styles.recentMeta, { color: colors.textMuted }]}>
                      {a.petName || 'Mascota eliminada'} · {a.date} {a.time}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: a.status === 'scheduled' ? colors.primary + '18' :
                      a.status === 'completed' ? colors.success + '18' : colors.error + '18',
                    borderColor: a.status === 'scheduled' ? colors.primary + '30' :
                      a.status === 'completed' ? colors.success + '30' : colors.error + '30',
                  }]}>
                    <Text style={[styles.statusText, {
                      color: a.status === 'scheduled' ? colors.primary :
                        a.status === 'completed' ? colors.success : colors.error,
                    }]}>
                      {a.status === 'scheduled' ? 'Prog.' : a.status === 'completed' ? 'Comp.' : 'Canc.'}
                    </Text>
                  </View>
                </View>
              ))}
              {stats.recentAppointments.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin citas registradas</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={loadStats}
              style={[styles.refreshBtn, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
            >
              <Ionicons name="refresh-outline" size={16} color={colors.teal} />
              <Text style={[styles.refreshText, { color: colors.teal }]}>Actualizar datos</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.loadingWrap}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>No se pudieron cargar las estadísticas</Text>
            <TouchableOpacity onPress={loadStats} style={[styles.retryBtn, { backgroundColor: colors.teal }]}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    width: '47.5%', padding: 18, borderRadius: RADIUS.md, borderWidth: 1, gap: 6,
  },
  statVal: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  statLabel: { fontSize: 11, fontWeight: '600' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },

  recentCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8,
  },
  recentIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recentName: { fontSize: 14, fontWeight: '700' },
  recentMeta: { fontSize: 11, marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: RADIUS.md, borderWidth: 1,
  },
  refreshText: { fontSize: 14, fontWeight: '700' },
})
