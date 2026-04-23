import { Ionicons } from '@expo/vector-icons'
import React, { useState, useEffect } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import Modal from '../../components/Modal'
import { RADIUS, SPECIES_EMOJI } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'
import { api } from '../../context/api'

const VT_OPTS = ['Rabia','Parvovirus','Moquillo','Hepatitis Canina','Leptospirosis','Bordetella','Leucemia Felina','Herpesvirus Felino','Calicivirus Felino','Panleucopenia','Otra']
  .map(v => ({ label: v, value: v }))
const DOC_OPTS = ['Análisis','Radiografía','Ecografía','Receta','Historia Clínica','Otro']
  .map(d => ({ label: d, value: d }))

const DOC_ICONS: Record<string, any> = {
  'Análisis':       'flask-outline',
  'Radiografía':    'scan-outline',
  'Ecografía':      'pulse-outline',
  'Receta':         'document-text-outline',
  'Historia Clínica':'clipboard-outline',
  'Otro':           'document-outline',
}

interface Vaccination {
  id: number
  petId: number
  name: string
  dateApplied: string
  nextDue: string | null
  vetName: string | null
  notes: string | null
}

interface HealthRecord {
  id: number
  petId: number
  date: string
  type: string
  description: string | null
  weight: number | null
  vetName: string | null
  notes: string | null
}

const EV = { type: 'Rabia', date: '', nextDate: '', vet: '', batch: '', notes: '' }
const ED = { name: '', type: 'Análisis', date: '', notes: '' }

export default function HealthScreen() {
  const { pets } = useApp()
  const { colors } = useTheme()
  const [sel, setSel] = useState<string | null>(null)
  const [showV, setShowV] = useState(false)
  const [showD, setShowD] = useState(false)
  const [vf, setVf] = useState<any>(EV)
  const [df, setDf] = useState<any>(ED)
  const [petVaccines, setPetVaccines] = useState<Vaccination[]>([])
  const [petDocs, setPetDocs] = useState<HealthRecord[]>([])

  const pet   = pets.find((p: any) => p.id === Number(sel))
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (sel) {
      loadPetData(Number(sel))
    }
  }, [sel])

  const loadPetData = async (petId: number) => {
    const [vacs, docs] = await Promise.all([
      api.getVaccinations(petId),
      api.getHealthRecordsByPet(petId)
    ])
    setPetVaccines(vacs)
    setPetDocs(docs)
  }

  const fv = (k: string) => ({ value: vf[k] || '', onChangeText: (v: string) => setVf((p: any) => ({ ...p, [k]: v })) })
  const fd = (k: string) => ({ value: df[k] || '', onChangeText: (v: string) => setDf((p: any) => ({ ...p, [k]: v })) })

  const addVaccine = async () => {
    if (!vf.type || !vf.date || !pet) return
    const petId = Number(pet.id)
    await api.createVaccination({
      petId,
      name: vf.type,
      dateApplied: vf.date,
      nextDue: vf.nextDate || null,
      vetName: vf.vet || null,
      notes: vf.notes || null
    })
    await loadPetData(petId)
    setShowV(false)
    setVf(EV)
  }

  const addDoc = async () => {
    if (!df.name || !df.date || !pet) return
    const petId = Number(pet.id)
    await api.createHealthRecord({
      petId,
      date: df.date,
      type: df.type,
      description: df.name || null,
      weight: null,
      vetName: df.vet || null,
      notes: df.notes || null
    })
    await loadPetData(petId)
    setShowD(false)
    setDf(ED)
  }

  const selectedAccent = pet?.colorTheme || colors.primary

  const allPetsVaccines = pets.reduce((acc: number, p: any) => {
    const pVac = pets.find((px: any) => px.id === p.id)
    return acc
  }, 0)

  const overdueCount = petVaccines.filter((v: any) => v.nextDue && v.nextDue < today).length

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Cartilla de Salud</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Historial médico y vacunas</Text>
        </View>
        {overdueCount > 0 && (
          <View style={[styles.alertBadge, { backgroundColor: '#FF6B6B18', borderColor: '#FF6B6B40' }]}>
            <Ionicons name="alert-circle" size={14} color="#FF6B6B" />
            <Text style={[styles.alertBadgeText, { color: '#FF6B6B' }]}>{overdueCount} vencida{overdueCount !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {pets.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin mascotas</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Registra una mascota primero</Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Selecciona mascota</Text>
            {pets.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSel(String(p.id))}
                style={[
                  styles.petSelect,
                  { backgroundColor: sel === String(p.id) ? (p.colorTheme || colors.primary) + '20' : colors.surface, borderColor: sel === String(p.id) ? p.colorTheme || colors.primary : colors.glassBorder }
                ]}
              >
                <Text style={{ fontSize: 24 }}>{SPECIES_EMOJI[p.species] || '🐾'}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.petSelectName, { color: colors.textPrimary }]}>{p.name}</Text>
                  <Text style={[styles.petSelectSpecies, { color: colors.textSecondary }]}>{p.species}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sel && pet && (
          <View style={{ padding: 16 }}>
            <View style={[styles.petHeader, { backgroundColor: selectedAccent + '12', borderColor: selectedAccent + '30' }]}>
              <Text style={{ fontSize: 36 }}>{SPECIES_EMOJI[(pet.species || '') as keyof typeof SPECIES_EMOJI] || '🐾'}</Text>
              <Text style={[styles.petHeaderName, { color: colors.textPrimary }]}>{pet.name}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setShowV(true)}
                style={[styles.actionBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Vacuna</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowD(true)}
                style={[styles.actionBtn, { backgroundColor: colors.teal + '15', borderColor: colors.teal + '30' }]}
              >
                <Ionicons name="document-text-outline" size={20} color={colors.teal} />
                <Text style={[styles.actionBtnText, { color: colors.teal }]}>Documento</Text>
              </TouchableOpacity>
            </View>

            {petVaccines.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vacunas</Text>
                {petVaccines.map((v: any) => (
                  <View key={v.id} style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                    <View style={styles.recordIconBox}>
                      <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>{v.name}</Text>
                      <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                        {new Date(v.dateApplied).toLocaleDateString('es-ES')}
                        {v.nextDue && v.nextDue < today ? ' (vencida)' : v.nextDue ? ` • Próxima: ${new Date(v.nextDue).toLocaleDateString('es-ES')}` : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {petDocs.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Documentos</Text>
                {petDocs.map((d: any) => (
                  <View key={d.id} style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                    <View style={styles.recordIconBox}>
                      <Ionicons name={DOC_ICONS[d.type] || 'document-text-outline'} size={18} color={colors.teal} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>{d.type}</Text>
                      {d.description && <Text style={[styles.recordDesc, { color: colors.textSecondary }]}>{d.description}</Text>}
                      <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                        {new Date(d.date).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal isOpen={showV} onClose={() => setShowV(false)} title="Registrar Vacuna">
        <View style={{ gap: 12 }}>
          <FSelect label="Vacuna" value={vf.type} options={VT_OPTS} onChange={v => setVf((p: any) => ({ ...p, type: v }))} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <FInput label="Fecha" {...fv('date')} />
            </View>
            <View style={{ flex: 1 }}>
              <FInput label="Próxima fecha" {...fv('nextDate')} />
            </View>
          </View>
          <FInput label="Veterinario" placeholder="Nombre del vet" {...fv('vet')} />
          <FTextarea label="Notas" placeholder="Observaciones..." {...fv('notes')} />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Button variant="secondary" onPress={() => setShowV(false)}>Cancelar</Button>
            <Button onPress={addVaccine} disabled={!vf.type || !vf.date}>Guardar</Button>
          </View>
        </View>
      </Modal>

      <Modal isOpen={showD} onClose={() => setShowD(false)} title="Registrar Documento">
<View style={{ gap: 12 }}>
           <FSelect label="Tipo" value={df.type} options={DOC_OPTS} onChange={v => setDf((p: any) => ({ ...p, type: v }))} />
           <FInput label="Descripción" placeholder="Título o descripción" {...fv('name')} />
           <FInput label="Fecha" {...fd('date')} />
           <FInput label="Veterinario" placeholder="Nombre del vet" {...fv('vet')} />
           <FTextarea label="Notas" placeholder="Observaciones..." {...fv('notes')} />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Button variant="secondary" onPress={() => setShowD(false)}>Cancelar</Button>
            <Button onPress={addDoc} disabled={!df.name || !df.date}>Guardar</Button>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 2 },
  alertBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  alertBadgeText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  emptyCard: { margin: 16, padding: 32, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyText: { fontSize: 14, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  petSelect: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
  petSelectName: { fontSize: 16, fontWeight: '600' },
  petSelectSpecies: { fontSize: 13 },
  petHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  petHeaderName: { fontSize: 20, fontWeight: '700', marginLeft: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  recordCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  recordIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recordTitle: { fontSize: 15, fontWeight: '600' },
  recordDesc: { fontSize: 13, marginTop: 2 },
  recordDate: { fontSize: 12, marginTop: 2 },
})