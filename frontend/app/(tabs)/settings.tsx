import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { RADIUS } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

// ─── Setting row ──────────────────────────────────────────────────────────────
function SettingRow({ iconName, iconBg, title, desc, colors, children, last }: any) {
  return (
    <View style={[
      styles.settingRow,
      !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glassBorder },
    ]}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={17} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
        {desc && <Text style={[styles.settingDesc, { color: colors.textMuted }]}>{desc}</Text>}
      </View>
      {children}
    </View>
  )
}

// ─── Card group ───────────────────────────────────────────────────────────────
function SettingCard({ children, colors }: any) {
  return (
    <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
      {children}
    </View>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function GroupLabel({ text, colors }: any) {
  return <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{text}</Text>
}

export default function SettingsScreen() {
  const { notifications, toggleNotifications, pets, appointments } = useApp()
  const { colors } = useTheme()
  const [email, setEmail]   = useState(true)
  const [push, setPush]     = useState(false)
  const [vacuna, setVacuna] = useState(false)
  const [saved, setSaved]   = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const clearData = () => {
    Alert.alert(
      'Eliminar todos los datos',
      'Esta acción borrará todas tus mascotas, citas e historial médico. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar todo',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear()
            Alert.alert('Datos eliminados', 'Reinicia la app para comenzar de nuevo.')
          }
        },
      ]
    )
  }

  const swColors = { false: colors.glassBorder, true: colors.primary }
  const upcomingAppts = appointments.filter((a: any) => {
    const today = new Date().toISOString().split('T')[0]
    return a.status === 'scheduled' && a.date >= today
  }).length

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configuración</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>Personaliza tu experiencia</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

        {/* ── Profile card ───────────────────────────────────────────────────── */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
          <View style={[styles.profileAvatarWrap, { backgroundColor: colors.primary }]}>
            <Text style={styles.profileInitial}>J</Text>
            <View style={[styles.profileOnline, { backgroundColor: colors.success, borderColor: colors.surface }]} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>Juan García</Text>
            <Text style={[styles.profileEmail, { color: colors.textMuted }]}>juan@ejemplo.com</Text>
          </View>

          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
          >
            <Ionicons name="pencil-outline" size={15} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Stats row ──────────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatTile value={pets.length}      label="Mascotas"  icon="paw-outline"       color={colors.primary}  colors={colors} />
          <StatTile value={appointments.length} label="Total Citas" icon="calendar-outline" color="#FFD166"       colors={colors} />
          <StatTile value={upcomingAppts}    label="Próximas"  icon="time-outline"       color={colors.success} colors={colors} />
        </View>

        {/* ── Notifications ──────────────────────────────────────────────────── */}
        <GroupLabel text="NOTIFICACIONES" colors={colors} />
        <SettingCard colors={colors}>
          <SettingRow iconName="notifications-outline" iconBg={colors.primary + '15'} title="Recordatorios de citas" desc="Alertas antes de tus citas programadas" colors={colors}>
            <Switch value={notifications} onValueChange={toggleNotifications} trackColor={swColors} thumbColor="#fff" />
          </SettingRow>
          <SettingRow iconName="mail-outline" iconBg={colors.primary + '15'} title="Confirmaciones por email" desc="Recibe resúmenes en tu correo" colors={colors}>
            <Switch value={email} onValueChange={setEmail} trackColor={swColors} thumbColor="#fff" />
          </SettingRow>
          <SettingRow iconName="phone-portrait-outline" iconBg={colors.primary + '15'} title="Notificaciones push" desc="Alertas en tiempo real en tu dispositivo" colors={colors}>
            <Switch value={push} onValueChange={setPush} trackColor={swColors} thumbColor="#fff" />
          </SettingRow>
          <SettingRow iconName="shield-checkmark-outline" iconBg={colors.primary + '15'} title="Alertas de vacunas" desc="Aviso cuando una vacuna está por vencer" colors={colors} last>
            <Switch value={vacuna} onValueChange={setVacuna} trackColor={swColors} thumbColor="#fff" />
          </SettingRow>
        </SettingCard>

        {/* ── Appearance ─────────────────────────────────────────────────────── */}
        <GroupLabel text="APARIENCIA" colors={colors} />
        <SettingCard colors={colors}>
          <SettingRow iconName="moon-outline" iconBg={colors.primary + '15'} title="Tema del sistema" desc="Cambia automáticamente con el dispositivo" colors={colors} last>
            <Switch value={true} onValueChange={() => {}} trackColor={swColors} thumbColor="#fff" />
          </SettingRow>
        </SettingCard>

        {/* ── Account ────────────────────────────────────────────────────────── */}
        <GroupLabel text="CUENTA" colors={colors} />
        <SettingCard colors={colors}>
          <SettingRow iconName="cloud-upload-outline" iconBg={colors.primary + '15'} title="Exportar datos" desc="Descarga un respaldo de tu información" colors={colors}>
            <TouchableOpacity style={[styles.actionChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.actionChipText, { color: colors.primary }]}>Exportar</Text>
            </TouchableOpacity>
          </SettingRow>
          <SettingRow iconName="trash-outline" iconBg="#FF6B6B15" title="Limpiar datos" desc="Elimina todos los datos guardados en el dispositivo" colors={colors} last>
            <TouchableOpacity
              onPress={clearData}
              style={[styles.actionChip, { backgroundColor: '#FF6B6B15', borderColor: '#FF6B6B30' }]}
            >
              <Text style={[styles.actionChipText, { color: '#FF6B6B' }]}>Limpiar</Text>
            </TouchableOpacity>
          </SettingRow>
        </SettingCard>

        {/* ── About ──────────────────────────────────────────────────────────── */}
        <GroupLabel text="ACERCA DE" colors={colors} />
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
          <View style={[styles.aboutIconWrap, { backgroundColor: colors.primary }]}>
            <Ionicons name="paw" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aboutAppName, { color: colors.textPrimary }]}>
              <Text style={{ color: colors.primary }}>P</Text>Vet
            </Text>
            <Text style={[styles.aboutVersion, { color: colors.textMuted }]}>
              Versión 1.0.0 · Veterinaria Inteligente
            </Text>
          </View>
          <View style={[styles.aboutBadge, { backgroundColor: colors.success + '18', borderColor: colors.success + '30' }]}>
            <Text style={[styles.aboutBadgeText, { color: colors.success }]}>Activo</Text>
          </View>
        </View>
        <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
          PVet es tu plataforma de gestión veterinaria. Registra mascotas, agenda citas, lleva la cartilla de salud y más — todo en un solo lugar.
        </Text>

        {/* ── Save button ────────────────────────────────────────────────────── */}
        <View style={styles.saveArea}>
          {saved && (
            <View style={[styles.savedPill, { backgroundColor: colors.success + '18', borderColor: colors.success + '30' }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[styles.savedText, { color: colors.success }]}>¡Guardado!</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={save}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

function StatTile({ value, label, icon, color, colors }: any) {
  return (
    <View style={[styles.statTile, { backgroundColor: color + '10', borderColor: color + '20' }]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.statTileVal, { color }]}>{value}</Text>
      <Text style={[styles.statTileLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen:         { flex: 1 },
  header:         { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle:    { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  headerSub:      { fontSize: 12, marginTop: 3 },

  // Profile
  profileCard:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 16 },
  profileAvatarWrap:{ width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 24, fontWeight: '800', color: '#fff' },
  profileOnline:  { position: 'absolute', bottom: 3, right: 3, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  profileName:    { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  profileEmail:   { fontSize: 12, marginTop: 2 },
  editProfileBtn: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // Stats
  statsRow:       { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statTile:       { flex: 1, alignItems: 'center', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, gap: 4 },
  statTileVal:    { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statTileLabel:  { fontSize: 9, fontWeight: '600', textAlign: 'center' },

  // Settings
  groupLabel:     { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },
  settingCard:    { borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  settingRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  settingIcon:    { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  settingTitle:   { fontWeight: '600', fontSize: 14 },
  settingDesc:    { fontSize: 11, marginTop: 2, lineHeight: 16 },

  // Action chips
  actionChip:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  actionChipText: { fontSize: 12, fontWeight: '700' },

  // About
  aboutCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12 },
  aboutIconWrap:  { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aboutAppName:   { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  aboutVersion:   { fontSize: 11, marginTop: 2 },
  aboutBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  aboutBadgeText: { fontSize: 11, fontWeight: '700' },
  aboutDesc:      { fontSize: 13, lineHeight: 21, marginBottom: 28 },

  // Save
  saveArea:       { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  savedPill:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  savedText:      { fontSize: 13, fontWeight: '700' },
  saveBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14 },
  saveBtnText:    { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: -0.2 },
})
