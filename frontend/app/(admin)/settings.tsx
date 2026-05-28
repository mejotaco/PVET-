import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RADIUS } from '../../constants/theme'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'

export default function AdminSettings() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuth()

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.glassBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configuración</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>Panel de administración</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
          <View style={[styles.avatar, { backgroundColor: colors.teal }]}>
            <Text style={styles.avatarText}>{(user?.name || 'V')[0].toUpperCase()}</Text>
            <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.surface }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.name || 'Veterinario'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{user?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.teal + '18', borderColor: colors.teal + '30' }]}>
              <Ionicons name="shield-outline" size={12} color={colors.teal} />
              <Text style={[styles.roleText, { color: colors.teal }]}>Veterinario</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CUENTA</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <TouchableOpacity onPress={confirmLogout} style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.error }]}>Cerrar sesión</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>Salir del panel de administración</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>INFORMACIÓN</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <View style={[styles.aboutCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.aboutIcon, { backgroundColor: colors.teal }]}>
                <Ionicons name="paw" size={22} color="#fff" />
              </View>
              <View>
                <Text style={[styles.aboutTitle, { color: colors.textPrimary }]}>
                  <Text style={{ color: colors.teal }}>P</Text>Vet Admin
                </Text>
                <Text style={[styles.aboutVersion, { color: colors.textMuted }]}>v1.0.0 · Panel del Veterinario</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.teal + '18', borderColor: colors.teal + '30' }]}>
                <Text style={[styles.badgeText, { color: colors.teal }]}>Admin</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CREDENCIALES</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Acceso Veterinario</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>Email: vet@ejemplo.com</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>Contraseña: vet123</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Acceso Dueño</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>Email: juan@ejemplo.com</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>Contraseña: owner123</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, marginTop: 2 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 18, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 24,
  },
  avatar: { width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  onlineDot: { position: 'absolute', bottom: 3, right: 3, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  profileName: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  profileEmail: { fontSize: 12, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, marginTop: 6, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, fontWeight: '700' },

  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  card: { borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowDesc: { fontSize: 11, marginTop: 1 },
  divider: { height: 1, marginHorizontal: 14 },

  aboutCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  aboutIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aboutTitle: { fontSize: 18, fontWeight: '800' },
  aboutVersion: { fontSize: 11, marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, marginLeft: 'auto' },
  badgeText: { fontSize: 10, fontWeight: '700' },
})
