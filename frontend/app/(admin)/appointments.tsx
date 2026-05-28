import { Ionicons } from '@expo/vector-icons'
import React, { useState, useEffect } from 'react'
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
  View, Alert, Modal, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RADIUS } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { api } from '../../context/api'

interface Appointment {
  id: number; petId: number; service: string; date: string; time: string
  vet: string | null; location: string | null; status: string; notes: string | null
  createdAt: string
}
interface Pet { id: number; name: string; species: string | null }

const STATUS_OPTIONS = ['scheduled', 'completed', 'cancelled']
const STATUS_LABELS: Record<string, string> = { scheduled: 'Programada', completed: 'Completada', cancelled: 'Cancelada' }

export default function AdminAppointments() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [appts, setAppts] = useState<Appointment[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    petId: '', service: '', date: '', time: '', vet: '', location: '', notes: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [a, p] = await Promise.all([api.getAppointments(), api.getPets()])
      setAppts(a)
      setPets(p)
    } catch { Alert.alert('Error', 'No se pudieron cargar los datos') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const today = new Date().toISOString().split('T')[0]

  const filtered = appts.filter(a => {
    if (filter === 'upcoming') return a.status === 'scheduled' && a.date >= today
    if (filter === 'past') return a.status === 'completed' || (a.status === 'scheduled' && a.date < today)
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const openCreate = () => {
    setEditing(null)
    setForm({ petId: '', service: '', date: today, time: '', vet: '', location: '', notes: '' })
    setShowModal(true)
  }

  const openEdit = (a: Appointment) => {
    setEditing(a)
    setForm({
      petId: a.petId?.toString() || '', service: a.service, date: a.date,
      time: a.time, vet: a.vet || '', location: a.location || '', notes: a.notes || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.service.trim() || !form.date || !form.time) {
      Alert.alert('Error', 'Servicio, fecha y hora son obligatorios'); return
    }
    setSaving(true)
    try {
      const payload = {
        petId: form.petId ? parseInt(form.petId) : null,
        service: form.service.trim(), date: form.date, time: form.time,
        vet: form.vet.trim() || null, location: form.location.trim() || null,
        status: editing ? editing.status : 'scheduled', notes: form.notes.trim() || null,
      }
      if (editing) {
        await api.updateAppointment(editing.id, payload)
      } else {
        await api.createAppointment(payload)
      }
      setShowModal(false)
      loadData()
    } catch (e: any) { Alert.alert('Error', e?.message || 'No se pudo guardar') }
    finally { setSaving(false) }
  }

  const changeStatus = (appt: Appointment, status: string) => {
    Alert.alert('Cambiar estado', `¿Marcar como "${STATUS_LABELS[status]}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí', onPress: async () => {
        try { await api.updateAppointment(appt.id, { status }); loadData() }
        catch (e: any) { Alert.alert('Error', e?.message) }
      }},
    ])
  }

  const confirmDelete = (appt: Appointment) => {
    Alert.alert('Eliminar cita', '¿Eliminar esta cita? No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await api.deleteAppointment(appt.id); loadData() }
        catch (e: any) { Alert.alert('Error', e?.message) }
      }},
    ])
  }

  const getPetName = (petId: number) => pets.find(p => p.id === petId)?.name || 'Mascota eliminada'

  const FILTERS = [
    { key: 'all', label: 'Todas' },
    { key: 'upcoming', label: 'Próximas' },
    { key: 'past', label: 'Pasadas' },
    { key: 'cancelled', label: 'Canceladas' },
  ]

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.glassBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Citas</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>{appts.length} registradas</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)}
            style={[styles.filterChip, {
              backgroundColor: filter === f.key ? colors.teal + '20' : colors.surface,
              borderColor: filter === f.key ? colors.teal : colors.glassBorder,
            }]}>
            <Text style={[styles.filterText, { color: filter === f.key ? colors.teal : colors.textSecondary }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {filtered.map(a => {
            const petName = getPetName(a.petId)
            const statusColor = a.status === 'scheduled' ? colors.primary : a.status === 'completed' ? colors.success : colors.error
            return (
              <View key={a.id} style={[styles.apptCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                <View style={[styles.apptStripe, { backgroundColor: statusColor }]} />
                <View style={[styles.dateBox, { backgroundColor: statusColor + '15' }]}>
                  <Text style={[styles.dateMonth, { color: statusColor }]}>
                    {a.date ? new Date(a.date + 'T00:00').toLocaleDateString('es-ES', { month: 'short' }).toUpperCase() : '—'}
                  </Text>
                  <Text style={[styles.dateDay, { color: statusColor }]}>
                    {a.date ? new Date(a.date + 'T00:00').getDate() : '—'}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.apptService, { color: colors.textPrimary }]}>{a.service}</Text>
                  <Text style={[styles.apptPet, { color: colors.textSecondary }]}>{petName}</Text>
                  <View style={styles.apptMeta}>
                    <Ionicons name="time-outline" size={11} color={colors.textMuted} />
                    <Text style={[styles.apptMetaText, { color: colors.textMuted }]}>{a.time}</Text>
                    {a.vet && <><Text style={[styles.apptMetaText, { color: colors.textMuted }]}>·</Text><Ionicons name="person-outline" size={11} color={colors.textMuted} /><Text style={[styles.apptMetaText, { color: colors.textMuted }]}>{a.vet}</Text></>}
                  </View>
                </View>
                <View style={styles.actionCol}>
                  {a.status === 'scheduled' && (
                    <>
                      <TouchableOpacity onPress={() => changeStatus(a, 'completed')} style={[styles.miniBtn, { backgroundColor: colors.success + '15' }]}>
                        <Ionicons name="checkmark" size={14} color={colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => changeStatus(a, 'cancelled')} style={[styles.miniBtn, { backgroundColor: colors.error + '15' }]}>
                        <Ionicons name="close" size={14} color={colors.error} />
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity onPress={() => openEdit(a)} style={[styles.miniBtn, { backgroundColor: colors.teal + '15' }]}>
                    <Ionicons name="create-outline" size={14} color={colors.teal} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(a)} style={[styles.miniBtn, { backgroundColor: colors.error + '15' }]}>
                    <Ionicons name="trash-outline" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
          {filtered.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin citas</Text>
          )}
        </ScrollView>
      )}

      <TouchableOpacity onPress={openCreate} style={[styles.fab, { backgroundColor: colors.teal }]} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.background + 'cc' }]}>
          <ScrollView style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{editing ? 'Editar cita' : 'Nueva cita'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={22} color={colors.textSecondary} /></TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Mascota</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelectRow}>
              <TouchableOpacity onPress={() => setForm({...form, petId: ''})}
                style={[styles.petChip, { backgroundColor: !form.petId ? colors.teal + '20' : colors.background, borderColor: !form.petId ? colors.teal : colors.glassBorder }]}>
                <Text style={[styles.petChipText, { color: !form.petId ? colors.teal : colors.textSecondary }]}>Sin mascota</Text>
              </TouchableOpacity>
              {pets.map(p => (
                <TouchableOpacity key={p.id} onPress={() => setForm({...form, petId: p.id.toString()})}
                  style={[styles.petChip, { backgroundColor: form.petId === p.id.toString() ? colors.teal + '20' : colors.background, borderColor: form.petId === p.id.toString() ? colors.teal : colors.glassBorder }]}>
                  <Text style={[styles.petChipText, { color: form.petId === p.id.toString() ? colors.teal : colors.textSecondary }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Servicio *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={form.service} onChangeText={t => setForm({...form, service: t})} placeholder="Ej: Consulta General" placeholderTextColor={colors.textMuted} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha *</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
                  value={form.date} onChangeText={t => setForm({...form, date: t})} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Hora *</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
                  value={form.time} onChangeText={t => setForm({...form, time: t})} placeholder="HH:MM" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Veterinario</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={form.vet} onChangeText={t => setForm({...form, vet: t})} placeholder="Nombre del vet" placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Ubicación</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={form.location} onChangeText={t => setForm({...form, location: t})} placeholder="Consultorio / Clínica" placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Notas</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder, minHeight: 60, textAlignVertical: 'top' }]}
              value={form.notes} onChangeText={t => setForm({...form, notes: t})} placeholder="Notas..." multiline placeholderTextColor={colors.textMuted} />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={[styles.cancelBtn, { borderColor: colors.glassBorder }]}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={[styles.saveBtn, { backgroundColor: colors.teal, opacity: saving ? 0.7 : 1 }]}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>{editing ? 'Guardar' : 'Crear'}</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, marginTop: 2 },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  apptCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8,
    overflow: 'hidden', paddingRight: 12, paddingVertical: 12,
  },
  apptStripe: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  dateBox: { width: 44, alignItems: 'center', borderRadius: 10, paddingVertical: 6 },
  dateMonth: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  dateDay: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  apptService: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  apptPet: { fontSize: 11 },
  apptMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  apptMetaText: { fontSize: 11 },
  actionCol: { gap: 4 },
  miniBtn: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },

  emptyText: { textAlign: 'center', paddingVertical: 40, fontSize: 14 },

  fab: {
    position: 'absolute', right: 20, bottom: 90,
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },

  modalOverlay: { flex: 1, justifyContent: 'center', padding: 16 },
  modalContent: { borderRadius: RADIUS.lg, borderWidth: 1, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  row: { flexDirection: 'row', gap: 12 },
  petSelectRow: { flexDirection: 'row', gap: 6 },
  petChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginRight: 6 },
  petChipText: { fontSize: 13, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  cancelBtnText: { fontSize: 14, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.md, minWidth: 80, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
})
