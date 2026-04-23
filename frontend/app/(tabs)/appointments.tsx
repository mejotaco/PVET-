import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import Modal from '../../components/Modal'
import { RADIUS, SPECIES_EMOJI } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

const SERVICES = ['Consulta General','Vacunación','Desparasitación','Cirugía','Grooming','Odontología','Radiografía','Análisis de Sangre','Control de Peso','Urgencias']
const VETS     = ['Dr. Martínez','Dra. Rodríguez','Dr. López','Dra. García']
const TIMES    = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00']

const SERVICES_OPTS = SERVICES.map(s => ({ label: s, value: s }))
const VETS_OPTS     = VETS.map(v => ({ label: v, value: v }))
const TIMES_OPTS    = TIMES.map(t => ({ label: t, value: t }))
const EA = { petId: '', service: 'Consulta General', date: '', time: '09:00', vet: 'Dr. Martínez', notes: '' }

const FILTERS = [
  { value: 'all',       label: 'Todas',     icon: 'apps-outline'             },
  { value: 'upcoming',  label: 'Próximas',  icon: 'calendar-outline'         },
  { value: 'past',      label: 'Pasadas',   icon: 'checkmark-done-outline'   },
  { value: 'cancelled', label: 'Canceladas',icon: 'close-circle-outline'     },
]

const SERVICE_ICON: Record<string, any> = {
  'Consulta General': 'stethoscope-outline',
  'Vacunación': 'shield-checkmark-outline',
  'Desparasitación': 'bug-outline',
  'Cirugía': 'cut-outline',
  'Grooming': 'color-wand-outline',
  'Odontología': 'happy-outline',
  'Radiografía': 'scan-outline',
  'Análisis de Sangre': 'flask-outline',
  'Control de Peso': 'scale-outline',
  'Urgencias': 'alert-circle-outline',
}

export default function AppointmentsScreen() {
  const { pets, appointments, addAppointment, cancelAppointment } = useApp()
  const { colors } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<any>(EA)
  const [filter, setFilter] = useState('all')
  const today = new Date().toISOString().split('T')[0]

  const STATUS: Record<string, { bg: string; color: string; label: string; dot: string }> = {
    scheduled: { bg: colors.primary + '18', color: colors.primary,   label: 'Programada', dot: colors.primary   },
    cancelled:  { bg: '#FF6B6B18',           color: '#FF6B6B',        label: 'Cancelada',  dot: '#FF6B6B'        },
    completed:  { bg: '#4ECDC418',           color: '#4ECDC4',        label: 'Completada', dot: '#4ECDC4'        },
  }

  const f = (k: string) => ({
    value: form[k] || '',
    onChangeText: (v: string) => setForm((p: any) => ({ ...p, [k]: v })),
  })

  const filtered = appointments.filter((a: any) => {
    if (filter === 'upcoming')  return a.status === 'scheduled' && a.date >= today
    if (filter === 'past')      return a.date < today || a.status !== 'scheduled'
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  }).sort((a: any, b: any) => b.date.localeCompare(a.date))

  const petsOpts = pets.map((p: any) => ({ label: `${SPECIES_EMOJI[p.species] || '🐾'} ${p.name}`, value: p.id }))

  const upcomingCount  = appointments.filter((a: any) => a.status === 'scheduled' && a.date >= today).length
  const completedCount = appointments.filter((a: any) => a.status === 'completed').length

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Citas</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {upcomingCount > 0 ? `${upcomingCount} próxima${upcomingCount !== 1 ? 's' : ''}` : 'Sin citas próximas'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Mini stats ─────────────────────────────────────────────────────── */}
      <View style={[styles.miniStats, { borderBottomColor: colors.glassBorder }]}>
        <MiniStat value={appointments.length} label="Total" color={colors.textSecondary} colors={colors} />
        <View style={[styles.miniDivider, { backgroundColor: colors.glassBorder }]} />
        <MiniStat value={upcomingCount} label="Próximas" color={colors.primary} colors={colors} />
        <View style={[styles.miniDivider, { backgroundColor: colors.glassBorder }]} />
        <MiniStat value={completedCount} label="Completadas" color={colors.success} colors={colors} />
      </View>

      {/* ── Filter chips ───────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 52 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {FILTERS.map(({ value, label, icon }) => {
          const isActive = filter === value
          return (
            <TouchableOpacity
              key={value}
              onPress={() => setFilter(value)}
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.glassBorder },
                isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name={icon as any} size={12} color={isActive ? '#fff' : colors.textMuted} />
              <Text style={[styles.filterText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110, paddingTop: 4 }}
      >
        {filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="calendar-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin citas</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay citas en esta categoría
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={[styles.emptyAction, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.emptyActionText}>Agendar cita</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.map((appt: any) => {
          const pet    = pets.find((p: any) => p.id === appt.petId)
          const st     = STATUS[appt.status] || STATUS.scheduled
          const isPast = appt.date < today
          const d      = appt.date ? new Date(appt.date + 'T00:00') : null
          const accent = pet?.colorTheme || colors.primary
          const serviceIcon = SERVICE_ICON[appt.service] || 'medical-outline'

          return (
            <View key={appt.id} style={[styles.apptCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
              <View style={[styles.apptStripe, { backgroundColor: isPast ? colors.glassBorder : accent }]} />

              <View style={styles.apptBody}>
                {/* Date column */}
                <View style={[styles.dateCol, {
                  backgroundColor: isPast ? colors.glass : accent + '15',
                  borderColor: isPast ? colors.glassBorder : accent + '30',
                }]}>
                  <Text style={[styles.dateMonth, { color: isPast ? colors.textMuted : accent }]}>
                    {d ? d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase() : '—'}
                  </Text>
                  <Text style={[styles.dateDay, { color: isPast ? colors.textMuted : accent }]}>
                    {d ? d.getDate() : '—'}
                  </Text>
                  <Text style={[styles.dateYear, { color: isPast ? colors.textMuted : accent + 'AA' }]}>
                    {d ? d.getFullYear() : ''}
                  </Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.apptTop}>
                    <View style={[styles.serviceIconBox, { backgroundColor: isPast ? colors.glass : accent + '15' }]}>
                      <Ionicons name={serviceIcon} size={14} color={isPast ? colors.textMuted : accent} />
                    </View>
                    <Text style={[styles.apptService, { color: colors.textPrimary }]} numberOfLines={1}>
                      {appt.service}
                    </Text>
                  </View>

                  <View style={styles.apptMetaRow}>
                    <Text style={[styles.apptMetaText, { color: colors.textSecondary }]}>
                      {SPECIES_EMOJI[(pet?.species || '') as keyof typeof SPECIES_EMOJI] || '🐾'} {pet?.name || 'N/A'}
                    </Text>
                    <View style={[styles.metaDot, { backgroundColor: colors.glassBorder }]} />
                    <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                    <Text style={[styles.apptMetaText, { color: colors.textSecondary }]}>{appt.time}</Text>
                  </View>

                  <View style={styles.apptMetaRow}>
                    <Ionicons name="person-circle-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.apptMetaText, { color: colors.textMuted }]} numberOfLines={1}>{appt.vet}</Text>
                  </View>

                  {appt.notes ? (
                    <Text style={[styles.apptNotes, { color: colors.textMuted, borderLeftColor: colors.glassBorder }]} numberOfLines={1}>
                      "{appt.notes}"
                    </Text>
                  ) : null}
                </View>

                {/* Status badge */}
                <View style={styles.apptRight}>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                    <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>
              </View>

              {appt.status === 'scheduled' && !isPast && (
                <View style={[styles.apptFooter, { borderTopColor: colors.glassBorder }]}>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Cancelar cita', '¿Estás seguro de cancelar esta cita?', [
                      { text: 'No', style: 'cancel' },
                      { text: 'Sí, cancelar', style: 'destructive', onPress: () => cancelAppointment(appt.id) },
                    ])}
                    style={[styles.cancelBtn, { borderColor: '#FF6B6B40' }]}
                  >
                    <Ionicons name="close-circle-outline" size={14} color="#FF6B6B" />
                    <Text style={[styles.cancelText, { color: '#FF6B6B' }]}>Cancelar cita</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>

      {/* ── New appointment modal ───────────────────────────────────────────── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Cita">
        {pets.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="paw-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin mascotas</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 20 }}>
              Primero registra una mascota para poder agendar citas
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <FSelect label="Mascota" required value={form.petId} options={petsOpts} onChange={v => setForm((p: any) => ({ ...p, petId: v }))} />
            <FSelect label="Tipo de servicio" required value={form.service} options={SERVICES_OPTS} onChange={v => setForm((p: any) => ({ ...p, service: v }))} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FInput label="Fecha" required placeholder={today} {...f('date')} />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <FSelect label="Hora" required value={form.time} options={TIMES_OPTS} onChange={v => setForm((p: any) => ({ ...p, time: v }))} />
              </View>
            </View>
            <FSelect label="Veterinario" value={form.vet} options={VETS_OPTS} onChange={v => setForm((p: any) => ({ ...p, vet: v }))} />
            <FTextarea label="Notas adicionales" placeholder="Síntomas, motivo de la consulta..." {...f('notes')} />
            <View style={styles.modalButtons}>
              <Button variant="secondary" onPress={() => setShowModal(false)}>Cancelar</Button>
              <Button
                onPress={() => {
                  if (!form.petId || !form.date || !form.time) {
                    Alert.alert('Campos requeridos', 'Selecciona mascota, fecha y hora')
                    return
                  }
                  addAppointment(form)
                  setShowModal(false)
                  setForm(EA)
                }}
                disabled={!form.petId || !form.date}
              >
                Agendar
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </View>
  )
}

function MiniStat({ value, label, color, colors }: any) {
  return (
    <View style={styles.miniStatItem}>
      <Text style={[styles.miniStatVal, { color }]}>{value}</Text>
      <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, marginTop: 3 },
  addBtn:      { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  miniStats:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  miniStatItem:{ flex: 1, alignItems: 'center' },
  miniStatVal: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  miniStatLabel:{ fontSize: 10, fontWeight: '600', marginTop: 1 },
  miniDivider: { width: 1, height: 28 },

  filterChip:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText:  { fontSize: 12, fontWeight: '600' },

  emptyCard:     { alignItems: 'center', padding: 48, marginTop: 12, borderRadius: RADIUS.lg, borderWidth: 1, gap: 10 },
  emptyIconBox:  { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle:    { fontSize: 17, fontWeight: '800' },
  emptyText:     { fontSize: 13, textAlign: 'center' },
  emptyAction:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, marginTop: 8 },
  emptyActionText:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  apptCard:    { marginBottom: 12, borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden' },
  apptStripe:  { height: 3 },
  apptBody:    { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  dateCol:     { width: 52, alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: 10 },
  dateMonth:   { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  dateDay:     { fontSize: 24, fontWeight: '800', lineHeight: 28 },
  dateYear:    { fontSize: 9, fontWeight: '500' },
  apptTop:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  serviceIconBox:{ width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  apptService: { fontWeight: '700', fontSize: 13, flex: 1, letterSpacing: -0.1 },
  apptMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  apptMetaText:{ fontSize: 12 },
  metaDot:     { width: 3, height: 3, borderRadius: 2 },
  apptNotes:   { fontSize: 11, fontStyle: 'italic', marginTop: 5, paddingLeft: 8, borderLeftWidth: 2 },
  apptRight:   { alignItems: 'flex-end', paddingTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  statusDot:   { width: 5, height: 5, borderRadius: 3 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  apptFooter:  { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  cancelBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  cancelText:  { fontSize: 12, fontWeight: '600' },

  row:          { flexDirection: 'row' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
})
