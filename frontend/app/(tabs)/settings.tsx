import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState, useEffect } from 'react'
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, Share, Modal } from 'react-native'
import Button from '../../components/Button'
import { RADIUS } from '../../constants/theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { api } from '../../context/api'

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

function SettingCard({ children, colors }: any) {
  return (
    <View style={[styles.settingCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
      {children}
    </View>
  )
}

function GroupLabel({ text, colors }: any) {
  return <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{text}</Text>
}

export default function SettingsScreen() {
  const { notifications, toggleNotifications, pets, appointments, serverUrl, themeMode, setThemeMode } = useApp()
  const { user, logout } = useAuth()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [email, setEmail]   = useState(true)
  const [push, setPush]     = useState(false)
  const [vacuna, setVacuna] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (showProfileModal && user) {
      setProfileName(user.name || '')
      setProfileEmail(user.email || '')
      setProfilePhone(user.phone || '')
    }
  }, [showProfileModal, user])

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const clearData = () => {
    Alert.alert(
      'Eliminar todos los datos',
      'Esta acción borrará todas tus mascotas, citas e historial médico de la base de datos. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar todo',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const pet of pets) {
                await api.deletePet(pet.id)
              }
              for (const appt of appointments) {
                await api.deleteAppointment(appt.id)
              }
              await AsyncStorage.clear()
              Alert.alert('Datos eliminados', 'Todos los datos han sido eliminados. Reinicia la app para comenzar de nuevo.')
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'No se pudieron eliminar los datos')
            }
          }
        },
      ]
    )
  }

  const exportData = async () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        pets,
        appointments,
        stats: {
          totalPets: pets.length,
          totalAppointments: appointments.length,
        }
      }
      const jsonStr = JSON.stringify(data, null, 2)
      await Share.share({
        message: jsonStr,
        title: 'PVet - Exportación de datos',
      })
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        Alert.alert('Error', 'No se pudieron exportar los datos')
      }
    }
  }

  const testConnection = async () => {
    setConnecting(true)
    try {
      await api.clearCachedUrl()
      const url = await api.discover()
      const connected = await api.isConnected()
      if (connected) {
        Alert.alert('Conectado', `Servidor encontrado en:\n${url}`)
      } else {
        Alert.alert('Sin conexión', 'No se pudo conectar al servidor. Verifica que el backend esté corriendo.')
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Error de conexión')
    } finally {
      setConnecting(false)
    }
  }

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ])
  }

  const swColors = { false: colors.glassBorder, true: colors.primary }
  const upcomingAppts = appointments.filter((a: any) => {
    const today = new Date().toISOString().split('T')[0]
    return a.status === 'scheduled' && a.date >= today
  }).length

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.glassBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configuración</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>Personaliza tu experiencia</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
          <View style={[styles.profileAvatarWrap, { backgroundColor: colors.primary }]}>
            <Text style={styles.profileInitial}>{(user?.name || 'U')[0].toUpperCase()}</Text>
            <View style={[styles.profileOnline, { backgroundColor: colors.success, borderColor: colors.surface }]} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.name || 'Usuario'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{user?.email || 'Sin correo'}</Text>
          </View>

          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
            onPress={() => setShowProfileModal(true)}
          >
            <Ionicons name="pencil-outline" size={15} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatTile value={pets.length}      label="Mascotas"  icon="paw-outline"       color={colors.primary}  colors={colors} />
          <StatTile value={appointments.length} label="Total Citas" icon="calendar-outline" color="#FFD166"       colors={colors} />
          <StatTile value={upcomingAppts}    label="Próximas"  icon="time-outline"       color={colors.success} colors={colors} />
        </View>

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

        <GroupLabel text="APARIENCIA" colors={colors} />
        <SettingCard colors={colors}>
          <SettingRow iconName="sunny-outline" iconBg={colors.primary + '15'} title="Modo claro" desc="Tema claro siempre" colors={colors}>
            <Switch value={themeMode === 'light'} onValueChange={() => setThemeMode('light')} trackColor={swColors} thumbColor="#fff" />
          </SettingRow>
          <SettingRow iconName="moon-outline" iconBg={colors.primary + '15'} title="Modo oscuro" desc="Tema oscuro siempre" colors={colors}>
            <Switch value={themeMode === 'dark'} onValueChange={() => setThemeMode('dark')} trackColor={swColors} thumbColor="#fff" />
          </SettingRow>
          <SettingRow iconName="phone-portrait-outline" iconBg={colors.primary + '15'} title="Modo sistema" desc="Sigue la configuración del dispositivo" colors={colors} last>
            <Switch value={themeMode === 'system'} onValueChange={() => setThemeMode('system')} trackColor={swColors} thumbColor="#fff" />
          </SettingRow>
        </SettingCard>

        <GroupLabel text="CUENTA" colors={colors} />
        <SettingCard colors={colors}>
          <SettingRow iconName="log-out-outline" iconBg="#FF6B6B15" title="Cerrar sesión" desc="Salir de tu cuenta" colors={colors}>
            <TouchableOpacity
              onPress={confirmLogout}
              style={[styles.actionChip, { backgroundColor: '#FF6B6B15', borderColor: '#FF6B6B30' }]}
            >
              <Text style={[styles.actionChipText, { color: '#FF6B6B' }]}>Salir</Text>
            </TouchableOpacity>
          </SettingRow>
          <SettingRow iconName="cloud-upload-outline" iconBg={colors.primary + '15'} title="Exportar datos" desc="Comparte un respaldo de tu información" colors={colors}>
            <TouchableOpacity
              onPress={exportData}
              style={[styles.actionChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
            >
              <Text style={[styles.actionChipText, { color: colors.primary }]}>Exportar</Text>
            </TouchableOpacity>
          </SettingRow>
          <SettingRow iconName="trash-outline" iconBg="#FF6B6B15" title="Limpiar datos" desc="Elimina todos los datos del servidor" colors={colors}>
            <TouchableOpacity
              onPress={clearData}
              style={[styles.actionChip, { backgroundColor: '#FF6B6B15', borderColor: '#FF6B6B30' }]}
            >
              <Text style={[styles.actionChipText, { color: '#FF6B6B' }]}>Limpiar</Text>
            </TouchableOpacity>
          </SettingRow>
          <SettingRow iconName="server-outline" iconBg={colors.primary + '15'} title="Probar conexión" desc={serverUrl || 'No conectado'} colors={colors} last>
            <TouchableOpacity
              onPress={testConnection}
              disabled={connecting}
              style={[styles.actionChip, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}
            >
              <Text style={[styles.actionChipText, { color: connecting ? colors.textMuted : colors.success }]}>
                {connecting ? '...' : 'Probar'}
              </Text>
            </TouchableOpacity>
          </SettingRow>
        </SettingCard>

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

      <Modal visible={showProfileModal} transparent animationType="slide" onRequestClose={() => setShowProfileModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.background + 'cc' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Editar perfil</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={profileEmail}
              onChangeText={setProfileEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Teléfono</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={profilePhone}
              onChangeText={setProfilePhone}
              placeholder="+34 600 000 000"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setShowProfileModal(false)}>
                Cancelar
              </Button>
              <Button
                onPress={async () => {
                  if (!profileName.trim()) {
                    Alert.alert('Error', 'El nombre es obligatorio')
                    return
                  }
                  setSavingProfile(true)
                  try {
                    await api.updateProfile(user!.id, { name: profileName.trim(), email: profileEmail.trim() || undefined, phone: profilePhone.trim() || undefined })
                    setShowProfileModal(false)
                  } catch (e: any) {
                    Alert.alert('Error', e?.message || 'No se pudo guardar')
                  } finally {
                    setSavingProfile(false)
                  }
                }}
                disabled={savingProfile}
              >
                {savingProfile ? 'Guardando...' : 'Guardar'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  header:         { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle:    { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  headerSub:      { fontSize: 12, marginTop: 3 },

  profileCard:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 16 },
  profileAvatarWrap:{ width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 24, fontWeight: '800', color: '#fff' },
  profileOnline:  { position: 'absolute', bottom: 3, right: 3, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  profileName:    { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  profileEmail:   { fontSize: 12, marginTop: 2 },
  editProfileBtn: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  statsRow:       { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statTile:       { flex: 1, alignItems: 'center', padding: 14, borderRadius: RADIUS.md, borderWidth: 1, gap: 4 },
  statTileVal:    { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statTileLabel:  { fontSize: 9, fontWeight: '600', textAlign: 'center' },

  groupLabel:     { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },
  settingCard:    { borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  settingRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  settingIcon:    { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  settingTitle:   { fontWeight: '600', fontSize: 14 },
  settingDesc:    { fontSize: 11, marginTop: 2, lineHeight: 16 },

  actionChip:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  actionChipText: { fontSize: 12, fontWeight: '700' },

  aboutCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 12 },
  aboutIconWrap:  { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aboutAppName:   { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  aboutVersion:   { fontSize: 11, marginTop: 2 },
  aboutBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  aboutBadgeText: { fontSize: 11, fontWeight: '700' },
  aboutDesc:      { fontSize: 13, lineHeight: 21, marginBottom: 28 },

  saveArea:       { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  savedPill:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  savedText:      { fontSize: 13, fontWeight: '700' },
  saveBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14 },
  saveBtnText:    { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: -0.2 },

  modalOverlay:   { flex: 1, justifyContent: 'center', padding: 24 },
  modalContent:   { borderRadius: RADIUS.lg, borderWidth: 1, padding: 20 },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle:     { fontSize: 18, fontWeight: '800' },
  inputLabel:     { fontSize: 11, fontWeight: '700', marginBottom: 5, marginTop: 12 },
  input:          { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  modalActions:   { flexDirection: 'row', gap: 10, marginTop: 22, justifyContent: 'flex-end' },
})
