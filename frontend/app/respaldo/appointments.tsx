import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import Modal from '../../components/Modal'
import { RADIUS } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

const SERVICES = ['Consulta General','Vacunación','Desparasitación','Cirugía','Grooming','Odontología','Radiografía','Análisis de Sangre','Control de Peso','Urgencias']
const VETS = ['Dr. Martínez','Dra. Rodríguez','Dr. López','Dra. García']
const TIMES = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00']

const SERVICES_OPTS = SERVICES.map(s => ({ label: s, value: s }))
const VETS_OPTS = VETS.map(v => ({ label: v, value: v }))
const TIMES_OPTS = TIMES.map(t => ({ label: t, value: t }))
const EA = { petId: '', service: 'Consulta General', date: '', time: '09:00', vet: 'Dr. Martínez', notes: '' }

const FILTERS = [
  { value: 'all', label: 'Todas', icon: 'list-outline' },
  { value: 'upcoming', label: 'Próximas', icon: 'calendar-outline' },
  { value: 'past', label: 'Pasadas', icon: 'checkmark-done-outline' },
  { value: 'cancelled', label: 'Canceladas', icon: 'close-outline' },
]

export default function AppointmentsScreen() {
  const { pets, appointments, addAppointment, cancelAppointment } = useApp()
  const { colors } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<any>(EA)
  const [filter, setFilter] = useState('all')
  const today = new Date().toISOString().split('T')[0]

  const ST: Record<string, any> = {
    scheduled: { bg: colors.primary + '18', color: colors.primary, label: 'Programada', icon: 'time-outline' },
    cancelled: { bg: '#FF6B6B18', color: '#FF6B6B', label: 'Cancelada', icon: 'close-circle-outline' },
    completed: { bg: '#FFD16618', color: '#FFD166', label: 'Completada', icon: 'checkmark-circle-outline' },
  }

  const f = (k: string) => ({
    value: form[k] || '',
    onChangeText: (v: string) => setForm((p: any) => ({ ...p, [k]: v })),
  })

  const filtered = appointments.filter((a: any) => {
    if (filter === 'upcoming') return a.status === 'scheduled' && a.date >= today
    if (filter === 'past') return a.date < today || a.status !== 'scheduled'
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  }).sort((a: any, b: any) => b.date.localeCompare(a.date))

  const petsOpts = pets.map((p: any) => ({ label: `${p.name} (${p.species})`, value: p.id }))

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.glassBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Citas</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {appointments.length} registrada{appointments.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 50 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
      >
        {FILTERS.map(({ value, label, icon }) => (
          <TouchableOpacity
            key={value}
            onPress={() => setFilter(value)}
            style={[
              styles.filterBtn,
              { backgroundColor: colors.surface, borderColor: colors.glassBorder },
              filter === value && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Ionicons name={icon as any} size={12} color={filter === value ? '#fff' : colors.textSecondary} />
            <Text style={[styles.filterText, { color: filter === value ? '#fff' : colors.textSecondary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin citas</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay citas en esta categoría</Text>
            <Button onPress={() => setShowModal(true)} style={{ marginTop: 16 }}>Agendar Cita</Button>
          </View>
        ) : filtered.map((appt: any) => {
          const pet = pets.find((p: any) => p.id === appt.petId)
          const st = ST[appt.status] || ST.scheduled
          const isPast = appt.date < today
          const d = appt.date ? new Date(appt.date + 'T00:00') : null

          return (
            <View key={appt.id} style={[styles.apptCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
              <View style={styles.apptRow}>
                <View style={[styles.dateBox, {
                  backgroundColor: isPast ? colors.glass : colors.primary + '15',
                  borderColor: isPast ? colors.glassBorder : colors.primary + '30',
                }]}>
                  <Text style={[styles.dateMonth, { color: isPast ? colors.textMuted : colors.primary }]}>
                    {d ? d.toLocaleDateString('es-ES', { month: 'short' }) : '—'}
                  </Text>
                  <Text style={[styles.dateDay, { color: isPast ? colors.textMuted : colors.primary }]}>
                    {d ? d.getDate() : '—'}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.apptTitleRow}>
                    <Text style={[styles.apptService, { color: colors.textPrimary }]} numberOfLines={1}>
                      {appt.service}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="paw-outline" size={11} color={colors.textMuted} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {pet?.name || 'N/A'}
                    </Text>
                    <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
                    <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{appt.time}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={11} color={colors.textMuted} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {appt.vet}
                    </Text>
                  </View>

                  {appt.notes ? (
                    <Text style={[styles.apptNotes, { color: colors.textMuted }]} numberOfLines={1}>
                      {appt.notes}
                    </Text>
                  ) : null}
                </View>
              </View>

              {appt.status === 'scheduled' && (
                <View style={[styles.apptBtns, { borderTopColor: colors.glassBorder }]}>
                  <Button size="sm" variant="danger" onPress={() => cancelAppointment(appt.id)}>
                    Cancelar cita
                  </Button>
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Agendar Nueva Cita">
        {pets.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 24, gap: 12 }}>
            <Ionicons name="paw-outline" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Primero registra una mascota
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <FSelect label="Mascota" required value={form.petId} options={petsOpts} onChange={v => setForm((p: any) => ({ ...p, petId: v }))} />
            <FSelect label="Servicio" required value={form.service} options={SERVICES_OPTS} onChange={v => setForm((p: any) => ({ ...p, service: v }))} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FInput label="Fecha (YYYY-MM-DD)" required placeholder={today} {...f('date')} />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <FSelect label="Hora" required value={form.time} options={TIMES_OPTS} onChange={v => setForm((p: any) => ({ ...p, time: v }))} />
              </View>
            </View>
            <FSelect label="Veterinario" value={form.vet} options={VETS_OPTS} onChange={v => setForm((p: any) => ({ ...p, vet: v }))} />
            <FTextarea label="Notas adicionales" placeholder="Síntomas, motivo..." {...f('notes')} />
            <View style={styles.modalButtons}>
              <Button variant="secondary" onPress={() => setShowModal(false)}>Cancelar</Button>
              <Button onPress={() => {
                if (!form.petId || !form.date || !form.time) {
                  Alert.alert('Campos requeridos', 'Selecciona mascota, fecha y hora')
                  return
                }
                addAppointment(form)
                setShowModal(false)
                setForm(EA)
              }} disabled={!form.petId || !form.date}>Agendar</Button>
            </View>
          </View>
        )}
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  emptyCard: {
    alignItems: 'center', padding: 48, marginTop: 20,
    borderRadius: RADIUS.md, borderWidth: 1, gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14 },
  apptCard: {
    marginBottom: 12, borderRadius: RADIUS.md,
    borderWidth: 1, padding: 16,
  },
  apptRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  dateBox: { width: 52, alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 8 },
  dateMonth: { fontSize: 10, textTransform: 'uppercase', fontWeight: '600' },
  dateDay: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
  apptTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  apptService: { fontWeight: '700', fontSize: 14, flex: 1 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaText: { fontSize: 12 },
  dot: { fontSize: 12, marginHorizontal: 2 },
  apptNotes: { fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  apptBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  row: { flexDirection: 'row' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
})