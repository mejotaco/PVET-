import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import Modal from '../../components/Modal'
import { PET_COLORS, RADIUS, SPECIES_EMOJI } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

const SPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Pez', 'Reptil', 'Gallina', 'Otro']
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

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mis Mascotas</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {pets.length === 0 ? 'Sin mascotas aún' : `${pets.length} registrada${pets.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={openAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o especie..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.textPrimary }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110, paddingTop: 4 }}
      >
        {filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '12' }]}>
              <Text style={{ fontSize: 36 }}>🐾</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {search ? 'Sin resultados' : 'Sin mascotas'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {search ? `No hay mascotas que coincidan con "${search}"` : 'Registra tu primera mascota para comenzar'}
            </Text>
            {!search && (
              <TouchableOpacity
                onPress={openAdd}
                style={[styles.emptyAction, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.emptyActionText}>Registrar mascota</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : filtered.map((pet: any) => {
          const accent = pet.colorTheme || colors.primary
          const vaccineCount = pet.vaccines?.length || 0
          const today = new Date().toISOString().split('T')[0]
          const hasOverdue = pet.vaccines?.some((v: any) => v.nextDate && v.nextDate < today)

          return (
            <TouchableOpacity
              key={pet.id}
              onPress={() => setDetail(pet)}
              activeOpacity={0.82}
              style={[styles.petCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
            >
              {/* Accent stripe */}
              <View style={[styles.petCardStripe, { backgroundColor: accent }]} />

              <View style={styles.petCardInner}>
                {/* Top row */}
                <View style={styles.petCardTop}>
                  <View style={[styles.petAvatar, { backgroundColor: accent + '20' }]}>
                    <Text style={{ fontSize: 30 }}>{SPECIES_EMOJI[pet.species] || '🐾'}</Text>
                    {hasOverdue && (
                      <View style={[styles.overdueIndicator, { backgroundColor: '#FF6B6B', borderColor: colors.surface }]}>
                        <Text style={{ fontSize: 8, color: '#fff' }}>!</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.petName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {pet.name}
                    </Text>
                    <Text style={[styles.petSpecies, { color: colors.textSecondary }]} numberOfLines={1}>
                      {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                    </Text>
                  </View>

                  <View style={styles.petCardActions}>
                    <TouchableOpacity
                      onPress={() => openEdit(pet)}
                      style={[styles.iconBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
                    >
                      <Ionicons name="pencil-outline" size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deletePet(pet.id)}
                      style={[styles.iconBtn, { backgroundColor: '#FF6B6B15', borderColor: '#FF6B6B30' }]}
                    >
                      <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info chips */}
                <View style={styles.chipRow}>
                  {pet.age ? (
                    <InfoChip icon="gift-outline" label={`${pet.age} años`} color={accent} colors={colors} />
                  ) : null}
                  {pet.weight ? (
                    <InfoChip icon="scale-outline" label={`${pet.weight} kg`} color={colors.textMuted} colors={colors} />
                  ) : null}
                  {vaccineCount > 0 ? (
                    <InfoChip
                      icon="shield-checkmark-outline"
                      label={`${vaccineCount} vacuna${vaccineCount !== 1 ? 's' : ''}`}
                      color={hasOverdue ? '#FF6B6B' : colors.success}
                      colors={colors}
                      highlight
                    />
                  ) : null}
                  {pet.microchip ? (
                    <InfoChip icon="radio-button-on-outline" label="Microchip" color={colors.amber} colors={colors} />
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── Add / Edit Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={edit ? 'Editar Mascota' : 'Registrar Mascota'}>
        <View style={{ gap: 12 }}>
          <FInput label="Nombre" required placeholder="Ej: Luna" {...f('name')} />
          <FSelect label="Especie" required value={form.species} options={SPECIES_OPTS} onChange={v => setForm((p: any) => ({ ...p, species: v }))} />
          <FInput label="Raza" placeholder="Ej: Labrador Retriever" {...f('breed')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FInput label="Edad (años)" keyboardType="numeric" placeholder="3" {...f('age')} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <FInput label="Peso (kg)" keyboardType="decimal-pad" placeholder="12.5" {...f('weight')} />
            </View>
          </View>
          <FInput label="Número de Microchip" placeholder="Código del microchip" {...f('microchip')} />
          <View>
            <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Color del perfil</Text>
            <View style={styles.colorRow}>
              {PET_COLORS.map((c: string) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setForm((p: any) => ({ ...p, colorTheme: c }))}
                  style={[styles.colorDot, { backgroundColor: c }]}
                >
                  {form.colorTheme === c && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <FTextarea label="Notas" placeholder="Alergias, condiciones especiales, alimentación..." {...f('notes')} />
          <View style={styles.modalButtons}>
            <Button variant="secondary" onPress={() => setShowModal(false)}>Cancelar</Button>
            <Button onPress={submit} disabled={!form.name || !form.species}>
              {edit ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </View>
        </View>
      </Modal>

      {/* ── Detail Modal ────────────────────────────────────────────────────── */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Perfil de mascota">
        {detail && (
          <View>
            {/* Hero section */}
            <View style={[styles.detailHero, { backgroundColor: (detail.colorTheme || colors.primary) + '12', borderColor: (detail.colorTheme || colors.primary) + '25' }]}>
              <View style={[styles.detailAvatar, { backgroundColor: (detail.colorTheme || colors.primary) + '25' }]}>
                <Text style={{ fontSize: 44 }}>{SPECIES_EMOJI[detail.species] || '🐾'}</Text>
              </View>
              <Text style={[styles.detailName, { color: colors.textPrimary }]}>{detail.name}</Text>
              <Text style={[styles.detailSpecies, { color: colors.textSecondary }]}>
                {detail.species}{detail.breed ? ` · ${detail.breed}` : ''}
              </Text>
            </View>

            {/* Stats grid */}
            <View style={styles.detailGrid}>
              {[
                { icon: '🎂', label: 'Edad', value: detail.age ? `${detail.age} años` : '—' },
                { icon: '⚖️', label: 'Peso', value: detail.weight ? `${detail.weight} kg` : '—' },
                { icon: '📡', label: 'Microchip', value: detail.microchip || '—' },
                { icon: '📅', label: 'Registrado', value: new Date(detail.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) },
              ].map(({ icon, label, value }) => (
                <View key={label} style={[styles.detailCell, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <Text style={styles.detailCellIcon}>{icon}</Text>
                  <Text style={[styles.detailCellLabel, { color: colors.textMuted }]}>{label}</Text>
                  <Text style={[styles.detailCellValue, { color: colors.textPrimary }]} numberOfLines={1}>{value}</Text>
                </View>
              ))}
            </View>

            {detail.notes && (
              <View style={[styles.notesBox, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                <View style={styles.notesHeader}>
                  <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.notesLabel, { color: colors.textMuted }]}>NOTAS</Text>
                </View>
                <Text style={[styles.notesText, { color: colors.textSecondary }]}>{detail.notes}</Text>
              </View>
            )}

            <View style={[styles.modalButtons, { marginTop: 20 }]}>
              <Button variant="secondary" onPress={() => { setDetail(null); openEdit(detail) }}>
                Editar
              </Button>
              <Button variant="danger" onPress={() => { deletePet(detail.id); setDetail(null) }}>
                Eliminar
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </View>
  )
}

function InfoChip({ icon, label, color, colors, highlight }: any) {
  return (
    <View style={[
      styles.chip,
      { backgroundColor: highlight ? color + '12' : colors.glass, borderColor: highlight ? color + '30' : colors.glassBorder }
    ]}>
      <Ionicons name={icon} size={11} color={highlight ? color : colors.textMuted} />
      <Text style={[styles.chipText, { color: highlight ? color : colors.textMuted }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, marginTop: 3 },
  addBtn:      { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, marginTop: 14, borderWidth: 1, borderRadius: RADIUS.sm, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 14 },
  clearBtn:    { padding: 2 },
  // Empty
  emptyCard:      { alignItems: 'center', padding: 48, marginTop: 10, borderRadius: RADIUS.lg, borderWidth: 1, gap: 10 },
  emptyIconBox:   { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle:     { fontSize: 18, fontWeight: '800' },
  emptyText:      { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyAction:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, marginTop: 8 },
  emptyActionText:{ color: '#fff', fontWeight: '700', fontSize: 14 },
  // Pet card
  petCard:        { marginBottom: 12, borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden', flexDirection: 'row' },
  petCardStripe:  { width: 4 },
  petCardInner:   { flex: 1, padding: 14 },
  petCardTop:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  petAvatar:      { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  overdueIndicator: { position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  petName:        { fontSize: 16, fontWeight: '800', letterSpacing: -0.3, marginBottom: 2 },
  petSpecies:     { fontSize: 12 },
  petCardActions: { flexDirection: 'row', gap: 7 },
  iconBtn:        { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:           { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  chipText:       { fontSize: 11, fontWeight: '600' },
  // Form
  row:            { flexDirection: 'row' },
  colorLabel:     { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  colorRow:       { flexDirection: 'row', gap: 8 },
  colorDot:       { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  modalButtons:   { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  // Detail
  detailHero:   { alignItems: 'center', padding: 24, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 16, gap: 8 },
  detailAvatar: { width: 80, height: 80, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  detailName:   { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  detailSpecies:{ fontSize: 14 },
  detailGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  detailCell:   { width: '47%', borderWidth: 1, borderRadius: 12, padding: 14, gap: 4 },
  detailCellIcon: { fontSize: 18, marginBottom: 2 },
  detailCellLabel:{ fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailCellValue:{ fontSize: 14, fontWeight: '700' },
  notesBox:     { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  notesHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notesLabel:   { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  notesText:    { fontSize: 14, lineHeight: 22 },
})
