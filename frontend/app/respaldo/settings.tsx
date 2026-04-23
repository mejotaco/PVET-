import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { RADIUS } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

function SRow({ iconName, title, desc, colors, children, last }: any) {
  return (
    <View style={[styles.sRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.glassBorder }]}>
      <View style={[styles.sRowIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={iconName} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sRowTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.sRowDesc, { color: colors.textSecondary }]}>{desc}</Text>
      </View>
      {children}
    </View>
  )
}

function SectionTitle({ title, colors }: any) {
  return <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
}

function SCard({ children, colors }: any) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
      {children}
    </View>
  )
}

export default function SettingsScreen() {
  const { notifications, toggleNotifications, pets, appointments } = useApp()
  const { colors } = useTheme()
  const [email, setEmail] = useState(true)
  const [push, setPush] = useState(false)
  const [saved, setSaved] = useState(false)
  const [vacuna,toggleVacuna ] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const clearData = () => {
    Alert.alert(
      '¿Eliminar todo?',
      'Se borrarán todos tus datos. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          await AsyncStorage.clear()
          Alert.alert('Listo', 'Datos eliminados. Reinicia la app.')
        }},
      ]
    )
  }

  const switchColors = { false: colors.glassBorder, true: colors.primary }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.glassBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configuración</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Personaliza tu experiencia</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.profileInitial}>J</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>Juan García</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>juan@ejemplo.com</Text>
            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatVal, { color: colors.primary }]}>{pets.length}</Text>
                <Text style={[styles.profileStatLabel, { color: colors.textMuted }]}>Mascotas</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatVal, { color: colors.amber }]}>{appointments.length}</Text>
                <Text style={[styles.profileStatLabel, { color: colors.textMuted }]}>Citas</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Ionicons name="pencil-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <SectionTitle title="NOTIFICACIONES" colors={colors} />
        <SCard colors={colors}>
          <SRow iconName="notifications-outline" title="Citas" desc="Recordatorios de citas próximas" colors={colors}>
            <Switch value={notifications} onValueChange={toggleNotifications} trackColor={switchColors} thumbColor="white" />
          </SRow>
          <SRow iconName="mail-outline" title="Email" desc="Confirmaciones en tu correo" colors={colors}>
            <Switch value={email} onValueChange={setEmail} trackColor={switchColors} thumbColor="white" />
          </SRow>
          <SRow iconName="phone-portrait-outline" title="Push" desc="Alertas en tiempo real" colors={colors}>
            <Switch value={push} onValueChange={setPush} trackColor={switchColors} thumbColor="white" />
          </SRow>
          <SRow iconName="shield-checkmark-outline" title="Vacunas" desc="Alerta cuando una vacuna vence" colors={colors} last>
            <Switch value={vacuna} onValueChange={toggleVacuna} trackColor={switchColors} thumbColor="white" />
          </SRow>
        </SCard>
        {/* Appearance */}
        <SectionTitle title="APARIENCIA" colors={colors} />
        <SCard colors={colors}>
          <SRow iconName="moon-outline" title="Modo oscuro" desc="Sigue la configuración del sistema" colors={colors} last>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.glassBorder, true: colors.primary }}
              thumbColor="white"
            />
          </SRow>
        </SCard>

        {/* Data */}
        <SectionTitle title="DATOS" colors={colors} />
        <SCard colors={colors}>
          <SRow iconName="trash-outline" title="Limpiar datos" desc="Elimina todos los datos guardados" colors={colors} last>
            <Button size="sm" variant="danger" onPress={clearData}>Limpiar</Button>
          </SRow>
        </SCard>

        {/* About */}
        <SectionTitle title="ACERCA DE" colors={colors} />
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
          <View style={[styles.aboutIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="paw" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aboutTitle, { color: colors.textPrimary }]}>
              <Text style={{ color: colors.primary }}>P</Text>Vet
            </Text>
            <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>
              Versión 1.0.0 · Veterinaria Inteligente
            </Text>
          </View>
        </View>
        <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
          PVet es tu plataforma de gestión veterinaria. Registra mascotas, agenda citas, lleva la cartilla de salud y más.
        </Text>

        {/* Save */}
        <View style={styles.saveRow}>
          {saved && (
            <View style={[styles.savedBadge, { backgroundColor: colors.success + '18' }]}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
              <Text style={[styles.savedText, { color: colors.success }]}>Guardado</Text>
            </View>
          )}
          <Button onPress={save} size="lg">Guardar Cambios</Button>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 18, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: 24,
  },
  profileAvatar: { width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 26, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: 17, fontWeight: '700' },
  profileEmail: { fontSize: 12, marginTop: 2 },
  profileStats: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  profileStat: { alignItems: 'center' },
  profileStatVal: { fontSize: 18, fontWeight: '800' },
  profileStatLabel: { fontSize: 10 },
  statDivider: { width: 1, height: 24 },
  editBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  card: { borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  sRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  sRowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sRowTitle: { fontWeight: '600', fontSize: 14 },
  sRowDesc: { fontSize: 12, marginTop: 1 },
  aboutCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 10 },
  aboutIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aboutTitle: { fontSize: 18, fontWeight: '800' },
  aboutVersion: { fontSize: 12, marginTop: 2 },
  aboutDesc: { fontSize: 13, lineHeight: 20, marginBottom: 24 },
  saveRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 8 },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  savedText: { fontSize: 13, fontWeight: '600' },
})