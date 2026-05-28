import { Ionicons } from '@expo/vector-icons'
import React, { useState, useEffect } from 'react'
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
  View, Alert, Modal, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RADIUS, SPECIES_EMOJI, PET_COLORS } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import * as db from '../../context/db'

interface Owner {
  id: number; name: string; email: string | null; phone: string | null
}
interface Pet {
  id: number; ownerId: number; name: string; species: string | null
  breed: string | null; age: number | null; weight: number | null
  ownerName: string | null; ownerPhone: string | null; colorTheme: string
  notes: string | null; microchip: string | null
}

const SPECIES_OPTIONS = ['Perro', 'Gato', 'Ave', 'Conejo', 'Pez', 'Reptil', 'Gallina', 'Otro']

export default function AdminPets() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [owners, setOwners] = useState<Owner[]>([])
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPets, setLoadingPets] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Pet | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', species: 'Perro', breed: '', age: '', weight: '',
    ownerName: '', ownerPhone: '', colorTheme: '#FF7A2F', notes: '',
  })

  useEffect(() => {
    (async () => {
      try {
        const o = await db.getOwners()
        setOwners(o)
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  useEffect(() => {
    if (!selectedOwner) return
    (async () => {
      setLoadingPets(true)
      try {
        const p = await db.getPetsByOwner(selectedOwner.id)
        setPets(p)
      } catch {} finally { setLoadingPets(false) }
    })()
  }, [selectedOwner])

  const openCreate = () => {
    if (!selectedOwner) { Alert.alert('Selecciona un cliente', 'Primero elige un cliente de la lista'); return }
    setEditing(null)
    setForm({ name: '', species: 'Perro', breed: '', age: '', weight: '', ownerName: selectedOwner.name, ownerPhone: selectedOwner.phone || '', colorTheme: '#FF7A2F', notes: '' })
    setShowModal(true)
  }

  const openEdit = (pet: Pet) => {
    setEditing(pet)
    setForm({
      name: pet.name, species: pet.species || 'Perro', breed: pet.breed || '',
      age: pet.age?.toString() || '', weight: pet.weight?.toString() || '',
      ownerName: pet.ownerName || '', ownerPhone: pet.ownerPhone || '',
      colorTheme: pet.colorTheme || '#FF7A2F', notes: pet.notes || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'El nombre es obligatorio'); return }
    setSaving(true)
    try {
      const payload = {
        ownerId: selectedOwner!.id,
        name: form.name.trim(), species: form.species, breed: form.breed.trim() || null,
        age: form.age ? parseInt(form.age) : null, weight: form.weight ? parseFloat(form.weight) : null,
        ownerName: form.ownerName.trim() || null, ownerPhone: form.ownerPhone.trim() || null,
        colorTheme: form.colorTheme, notes: form.notes.trim() || null,
        microchip: null, imageUri: null,
      }
      if (editing) {
        await db.updatePet(editing.id, payload)
      } else {
        await db.createPet(payload)
      }
      setShowModal(false)
      const p = await db.getPetsByOwner(selectedOwner!.id)
      setPets(p)
    } catch (e: any) { Alert.alert('Error', e?.message || 'No se pudo guardar') }
    finally { setSaving(false) }
  }

  const confirmDelete = (pet: Pet) => {
    Alert.alert('Eliminar mascota', `¿Eliminar a ${pet.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await db.deletePet(pet.id); const p = await db.getPetsByOwner(selectedOwner!.id); setPets(p) }
        catch (e: any) { Alert.alert('Error', e?.message) }
      }},
    ])
  }

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.glassBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Clientes</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>{owners.length} registrados</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ownerStrip} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {owners.map(o => (
              <TouchableOpacity key={o.id} onPress={() => setSelectedOwner(o)}
                style={[styles.ownerChip, {
                  backgroundColor: selectedOwner?.id === o.id ? colors.teal + '20' : colors.surface,
                  borderColor: selectedOwner?.id === o.id ? colors.teal : colors.glassBorder,
                }]}>
                <View style={[styles.ownerDot, { backgroundColor: selectedOwner?.id === o.id ? colors.teal : colors.textMuted }]} />
                <View>
                  <Text style={[styles.ownerChipName, { color: selectedOwner?.id === o.id ? colors.teal : colors.textPrimary }]}>{o.name.split(' ')[0]}</Text>
                  <Text style={[styles.ownerChipEmail, { color: colors.textMuted }]}>{o.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedOwner ? (
            <>
              <View style={[styles.ownerHeader, { borderBottomColor: colors.glassBorder }]}>
                <View>
                  <Text style={[styles.ownerName, { color: colors.textPrimary }]}>{selectedOwner.name}</Text>
                  <Text style={[styles.ownerInfo, { color: colors.textMuted }]}>
                    {selectedOwner.email}{selectedOwner.phone ? ` · ${selectedOwner.phone}` : ''}
                  </Text>
                </View>
                <Text style={[styles.petCount, { color: colors.teal }]}>{pets.length} mascotas</Text>
              </View>

              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                <TextInput style={[styles.searchInput, { color: colors.textPrimary }]}
                  value={search} onChangeText={setSearch}
                  placeholder="Buscar mascota..." placeholderTextColor={colors.textMuted} />
              </View>

              {loadingPets ? (
                <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.teal} /></View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                  {filtered.map(pet => (
                    <View key={pet.id} style={[styles.petCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                      <View style={[styles.petEmoji, { backgroundColor: (pet.colorTheme || colors.teal) + '20' }]}>
                        <Text style={{ fontSize: 24 }}>{SPECIES_EMOJI[pet.species as keyof typeof SPECIES_EMOJI] || '🐾'}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.petName, { color: colors.textPrimary }]}>{pet.name}</Text>
                        <Text style={[styles.petMeta, { color: colors.textMuted }]}>
                          {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}{pet.age ? ` · ${pet.age} años` : ''}
                        </Text>
                      </View>
                      <View style={styles.actions}>
                        <TouchableOpacity onPress={() => openEdit(pet)} style={[styles.actionBtn, { backgroundColor: colors.teal + '15' }]}>
                          <Ionicons name="create-outline" size={16} color={colors.teal} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmDelete(pet)} style={[styles.actionBtn, { backgroundColor: colors.error + '15' }]}>
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  {filtered.length === 0 && (
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                      {search ? 'Sin resultados' : 'Este cliente no tiene mascotas'}
                    </Text>
                  )}
                </ScrollView>
              )}

              <TouchableOpacity onPress={openCreate} style={[styles.fab, { backgroundColor: colors.teal }]} activeOpacity={0.85}>
                <Ionicons name="add" size={28} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noSelection}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.noSelectionText, { color: colors.textMuted }]}>Selecciona un cliente para ver sus mascotas</Text>
            </View>
          )}
        </>
      )}

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.background + 'cc' }]}>
          <ScrollView style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{editing ? 'Editar mascota' : 'Nueva mascota'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={22} color={colors.textSecondary} /></TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Nombre" placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Especie</Text>
            <View style={styles.speciesRow}>
              {SPECIES_OPTIONS.map(s => (
                <TouchableOpacity key={s} onPress={() => setForm({...form, species: s})}
                  style={[styles.speciesChip, {
                    backgroundColor: form.species === s ? colors.teal + '20' : colors.background,
                    borderColor: form.species === s ? colors.teal : colors.glassBorder,
                  }]}>
                  <Text style={[styles.speciesText, { color: form.species === s ? colors.teal : colors.textSecondary }]}>
                    {SPECIES_EMOJI[s]} {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Raza</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={form.breed} onChangeText={t => setForm({...form, breed: t})} placeholder="Raza" placeholderTextColor={colors.textMuted} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Edad (años)</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
                  value={form.age} onChangeText={t => setForm({...form, age: t})} placeholder="0" keyboardType="number-pad" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Peso (kg)</Text>
                <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
                  value={form.weight} onChangeText={t => setForm({...form, weight: t})} placeholder="0" keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Dueño</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={form.ownerName} onChangeText={t => setForm({...form, ownerName: t})} placeholder="Nombre del dueño" placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={form.ownerPhone} onChangeText={t => setForm({...form, ownerPhone: t})} placeholder="Teléfono" keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
            <View style={styles.colorRow}>
              {PET_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setForm({...form, colorTheme: c})}
                  style={[styles.colorDot, { backgroundColor: c, borderWidth: form.colorTheme === c ? 3 : 0, borderColor: colors.textPrimary }]} />
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Notas</Text>
            <TextInput style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
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

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  ownerStrip: { paddingVertical: 12, maxHeight: 64 },
  ownerChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  ownerDot: { width: 8, height: 8, borderRadius: 4 },
  ownerChipName: { fontSize: 13, fontWeight: '700' },
  ownerChipEmail: { fontSize: 10 },

  ownerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ownerName: { fontSize: 17, fontWeight: '800' },
  ownerInfo: { fontSize: 12, marginTop: 1 },
  petCount: { fontSize: 13, fontWeight: '700' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  noSelection: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noSelectionText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },

  petCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8,
  },
  petEmoji: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  petName: { fontSize: 15, fontWeight: '700' },
  petMeta: { fontSize: 11, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  speciesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  speciesChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  speciesText: { fontSize: 13, fontWeight: '600' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1 },
  cancelBtnText: { fontSize: 14, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.md, minWidth: 80, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
})
