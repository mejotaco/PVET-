import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import Modal from '../../components/Modal'
import { PET_COLORS, RADIUS, SPECIES_EMOJI } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

const SPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Pez', 'Reptil','Gallina','Otro']
const SPECIES_OPTS = SPECIES.map(s => ({ label: `${SPECIES_EMOJI[s]} ${s}`, value: s }))
const EF = { name: '', species: 'Perro', breed: '', age: '', weight: '', colorTheme: '#FF7A2F', notes: '', microchip: '' }

export default function PetsScreen() {
  const { pets, addPet, updatePet, deletePet } = useApp()
  const { colors } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [edit, setEdit] = useState<any>(null)
  const [form, setForm] = useState<any>(EF)
  const [detail, setDetail] = useState<any>(null)
  const [search, setSearch] = useState('')

  const filtered = pets.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.species.toLowerCase().includes(search.toLowerCase())
  )

  const f = (k: string) => ({
    value: form[k] || '',
    onChangeText: (v: string) => setForm((p: any) => ({ ...p, [k]: v })),
  })

  const openAdd = () => { setEdit(null); setForm(EF); setShowModal(true) }
  const openEdit = (pet: any) => { setEdit(pet); setForm({ ...EF, ...pet }); setShowModal(true) }
  const submit = () => {
    if (!form.name || !form.species) return
    edit ? updatePet(edit.id, form) : addPet(form)
    setShowModal(false)
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.glassBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mis Mascotas</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {pets.length} registrada{pets.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Button onPress={openAdd} icon="+" size="sm">Nueva</Button>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar mascota..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.textPrimary }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textMuted, fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{search ? 'Sin resultados' : 'Sin mascotas'}</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{search ? 'Prueba otro término' : 'Registra tu primera mascota'}</Text>
            {!search && <Button onPress={openAdd} icon="+" style={{ marginTop: 16 }}>Registrar</Button>}
          </Card>
        ) : filtered.map((pet: any) => (
          <Card key={pet.id} onPress={() => setDetail(pet)} style={styles.petCard}>
            <View style={styles.petCardTop}>
              <View style={[styles.petAvatar, { backgroundColor: (pet.colorTheme || colors.primary) + '22' }]}>
                <Text style={{ fontSize: 28 }}>{SPECIES_EMOJI[pet.species] || '🐾'}</Text>
              </View>
              <View style={styles.petActions}>
                <TouchableOpacity onPress={() => openEdit(pet)} style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePet(pet.id)} style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <Text>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.petName, { color: colors.textPrimary }]}>{pet.name}</Text>
            <Text style={[styles.petBreed, { color: colors.textSecondary }]}>{pet.species} · {pet.breed || 'Sin raza'}</Text>
            <View style={styles.chips}>
              {pet.age && <Chip icon="🎂" label={`${pet.age} años`} colors={colors} />}
              {pet.weight && <Chip icon="⚖️" label={`${pet.weight} kg`} colors={colors} />}
              {pet.microchip && <Chip icon="📡" label="Microchip" colors={colors} highlight />}
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={edit ? 'Editar Mascota' : 'Registrar Mascota'}>
        <View style={{ gap: 12 }}>
          <FInput label="Nombre" required placeholder="Ej: Luna" {...f('name')} />
          <FSelect label="Especie" required value={form.species} options={SPECIES_OPTS} onChange={v => setForm((p: any) => ({ ...p, species: v }))} />
          <FInput label="Raza" placeholder="Ej: Labrador" {...f('breed')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FInput label="Edad (años)" keyboardType="numeric" placeholder="3" {...f('age')} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Peso (kg)" keyboardType="decimal-pad" placeholder="12.5" {...f('weight')} /></View>
          </View>
          <FInput label="Nº Microchip" placeholder="Código del microchip" {...f('microchip')} />
          <View>
            <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Color del perfil</Text>
            <View style={styles.colorRow}>
              {PET_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setForm((p: any) => ({ ...p, colorTheme: c }))}
                  style={[styles.colorDot, { backgroundColor: c }, form.colorTheme === c && { borderColor: colors.textPrimary }]}
                />
              ))}
            </View>
          </View>
          <FTextarea label="Notas" placeholder="Alergias, condiciones especiales..." {...f('notes')} />
          <View style={styles.modalButtons}>
            <Button variant="secondary" onPress={() => setShowModal(false)}>Cancelar</Button>
            <Button onPress={submit}>{edit ? 'Guardar' : 'Registrar'}</Button>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Perfil de ${detail?.name || ''}`}>
        {detail && (
          <View>
            <View style={styles.detailTop}>
              <View style={[styles.detailAvatar, { backgroundColor: (detail.colorTheme || colors.primary) + '22' }]}>
                <Text style={{ fontSize: 40 }}>{SPECIES_EMOJI[detail.species] || '🐾'}</Text>
              </View>
              <View>
                <Text style={[styles.detailName, { color: colors.textPrimary }]}>{detail.name}</Text>
                <Text style={[styles.detailBreed, { color: colors.textSecondary }]}>{detail.species} · {detail.breed || 'Sin raza'}</Text>
              </View>
            </View>
            <View style={styles.detailGrid}>
              {[
                ['🎂 Edad', detail.age ? `${detail.age} años` : '—'],
                ['⚖️ Peso', detail.weight ? `${detail.weight} kg` : '—'],
                ['📡 Microchip', detail.microchip || '—'],
                ['📅 Registrado', new Date(detail.createdAt).toLocaleDateString('es-ES')],
              ].map(([k, v]) => (
                <View key={k} style={[styles.detailItem, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.detailKey, { color: colors.textMuted }]}>{k}</Text>
                  <Text style={[styles.detailVal, { color: colors.textPrimary }]}>{v}</Text>
                </View>
              ))}
            </View>
            {detail.notes && (
              <View style={[styles.notesBox, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                <Text style={[styles.detailKey, { color: colors.textMuted }]}>📝 NOTAS</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginTop: 6 }}>{detail.notes}</Text>
              </View>
            )}
            <View style={[styles.modalButtons, { marginTop: 16 }]}>
              <Button variant="secondary" onPress={() => { setDetail(null); openEdit(detail) }}>Editar</Button>
              <Button variant="danger" onPress={() => { deletePet(detail.id); setDetail(null) }}>Eliminar</Button>
            </View>
          </View>
        )}
      </Modal>
    </View>
  )
}

function Chip({ icon, label, colors, highlight }: any) {
  return (
    <View style={[styles.chip, {
      backgroundColor: highlight ? colors.primary + '15' : colors.surface,
      borderColor: highlight ? colors.primary + '40' : colors.glassBorder,
    }]}>
      <Text style={[styles.chipText, { color: highlight ? colors.primary : colors.textMuted }]}>
        {icon} {label}
      </Text>
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
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, borderWidth: 1,
    borderRadius: RADIUS.sm, paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, padding: 11, fontSize: 14 },
  emptyCard: { alignItems: 'center', padding: 48, marginTop: 20 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 14 },
  petCard: { marginBottom: 12 },
  petCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  petAvatar: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  petActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { borderWidth: 1, borderRadius: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  petName: { fontSize: 18, fontWeight: '700', marginBottom: 3 },
  petBreed: { fontSize: 13, marginBottom: 10 },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  chipText: { fontSize: 12 },
  row: { flexDirection: 'row' },
  colorLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 8 },
  colorDot: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  detailTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  detailAvatar: { width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  detailName: { fontSize: 22, fontWeight: '800' },
  detailBreed: { fontSize: 14 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  detailItem: { width: '47%', borderWidth: 1, borderRadius: 10, padding: 12 },
  detailKey: { fontSize: 11, marginBottom: 4 },
  detailVal: { fontWeight: '600', fontSize: 14 },
  notesBox: { borderWidth: 1, borderRadius: 10, padding: 14 },
})