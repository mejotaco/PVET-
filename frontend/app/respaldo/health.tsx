import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Button from '../../components/Button'
import { FInput, FSelect, FTextarea } from '../../components/FormField'
import Modal from '../../components/Modal'
import { RADIUS } from '../../constants/theme'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'

const VT_OPTS = ['Rabia','Parvovirus','Moquillo','Hepatitis Canina','Leptospirosis','Bordetella','Leucemia Felina','Herpesvirus Felino','Calicivirus Felino','Panleucopenia','Otra'].map(v => ({ label: v, value: v }))
const DOC_OPTS = ['Análisis','Radiografía','Ecografía','Receta','Historia Clínica','Otro'].map(d => ({ label: d, value: d }))

const DOC_ICONS: Record<string, any> = {
  'Análisis': 'flask-outline',
  'Radiografía': 'scan-outline',
  'Ecografía': 'pulse-outline',
  'Receta': 'document-text-outline',
  'Historia Clínica': 'clipboard-outline',
  'Otro': 'document-outline',
}

const EV = { type: 'Rabia', date: '', nextDate: '', vet: '', batch: '', notes: '' }
const ED = { name: '', type: 'Análisis', date: '', notes: '' }

export default function HealthScreen() {
  const { pets, updatePet } = useApp()
  const { colors } = useTheme()
  const [sel, setSel] = useState<string | null>(null)
  const [showV, setShowV] = useState(false)
  const [showD, setShowD] = useState(false)
  const [vf, setVf] = useState<any>(EV)
  const [df, setDf] = useState<any>(ED)

  const pet = pets.find((p: any) => p.id === sel)
  const today = new Date().toISOString().split('T')[0]

  const fv = (k: string) => ({ value: vf[k] || '', onChangeText: (v: string) => setVf((p: any) => ({ ...p, [k]: v })) })
  const fd = (k: string) => ({ value: df[k] || '', onChangeText: (v: string) => setDf((p: any) => ({ ...p, [k]: v })) })

  const addVaccine = () => {
    if (!vf.type || !vf.date) return
    updatePet(pet.id, { vaccines: [...(pet.vaccines || []), { ...vf, id: Date.now().toString() }] })
    setShowV(false)
    setVf(EV)
  }

  const addDoc = () => {
    if (!df.name) return
    updatePet(pet.id, { docs: [...(pet.docs || []), { ...df, id: Date.now().toString() }] })
    setShowD(false)
    setDf(ED)
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.glassBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Cartilla de Salud</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Historial médico y vacunas</Text>
      </View>

      {pets.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="medkit-outline" size={52} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary, marginTop: 12 }]}>Sin mascotas</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Registra mascotas primero</Text>
        </View>
      ) : (
        <>
          {/* Pet selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ maxHeight: 56 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
          >
            {pets.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSel(p.id)}
                style={[
                  styles.selectorBtn,
                  { backgroundColor: colors.surface, borderColor: colors.glassBorder },
                  sel === p.id && { backgroundColor: colors.primary + '18', borderColor: colors.primary },
                ]}
              >
                <Ionicons name="paw-outline" size={13} color={sel === p.id ? colors.primary : colors.textSecondary} />
                <Text style={[styles.selectorText, { color: sel === p.id ? colors.primary : colors.textSecondary }]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {!pet ? (
            <View style={styles.center}>
              <Ionicons name="paw-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 10 }]}>
                Selecciona una mascota
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1, paddingHorizontal: 16 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
            >
              {/* Vaccines section */}
              <SectionHeader
                icon="shield-checkmark-outline"
                title="Vacunas"
                count={pet.vaccines?.length || 0}
                onAdd={() => setShowV(true)}
                addLabel="Agregar"
                colors={colors}
              />

              {(!pet.vaccines || pet.vaccines.length === 0) ? (
                <EmptySection icon="shield-outline" text="Sin vacunas registradas" colors={colors} />
              ) : pet.vaccines.map((v: any) => {
                const overdue = v.nextDate && v.nextDate < today
                return (
                  <View key={v.id} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: overdue ? '#FF6B6B40' : colors.glassBorder }]}>
                    <View style={styles.itemRow}>
                      <View style={[styles.itemIconBox, { backgroundColor: overdue ? '#FF6B6B18' : colors.primary + '15' }]}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={overdue ? '#FF6B6B' : colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.itemTitleRow}>
                          <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{v.type}</Text>
                          {overdue && (
                            <View style={styles.overdueTag}>
                              <Text style={styles.overdueText}>VENCIDA</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.metaRow}>
                          <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
                          <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{v.date}</Text>
                          {v.nextDate && <>
                            <Text style={{ color: colors.textMuted }}>→</Text>
                            <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{v.nextDate}</Text>
                          </>}
                        </View>
                        {v.vet && (
                          <View style={styles.metaRow}>
                            <Ionicons name="person-outline" size={11} color={colors.textMuted} />
                            <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{v.vet}</Text>
                          </View>
                        )}
                        {v.batch && (
                          <View style={styles.metaRow}>
                            <Ionicons name="barcode-outline" size={11} color={colors.textMuted} />
                            <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>Lote: {v.batch}</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => updatePet(pet.id, { vaccines: pet.vaccines.filter((x: any) => x.id !== v.id) })}
                        style={[styles.deleteBtn, { backgroundColor: '#FF6B6B15', borderColor: '#FF6B6B30' }]}
                      >
                        <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}

              {/* Documents section */}
              <SectionHeader
                icon="document-text-outline"
                title="Documentos"
                count={pet.docs?.length || 0}
                onAdd={() => setShowD(true)}
                addLabel="Subir"
                colors={colors}
                style={{ marginTop: 20 }}
              />

              {(!pet.docs || pet.docs.length === 0) ? (
                <EmptySection icon="documents-outline" text="Sin documentos subidos" colors={colors} />
              ) : pet.docs.map((doc: any) => (
                <View key={doc.id} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <View style={styles.itemRow}>
                    <View style={[styles.itemIconBox, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name={DOC_ICONS[doc.type] || 'document-outline'} size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{doc.name}</Text>
                      <View style={styles.metaRow}>
                        <Ionicons name="folder-outline" size={11} color={colors.textMuted} />
                        <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{doc.type}</Text>
                        {doc.date && <>
                          <Text style={{ color: colors.textMuted }}>·</Text>
                          <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
                          <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{doc.date}</Text>
                        </>}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Vaccine Modal */}
      <Modal isOpen={showV} onClose={() => setShowV(false)} title="Registrar Vacuna">
        <View style={{ gap: 12 }}>
          <FSelect label="Tipo de Vacuna" required value={vf.type} options={VT_OPTS} onChange={v => setVf((p: any) => ({ ...p, type: v }))} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FInput label="Fecha Aplicación" required placeholder="YYYY-MM-DD" {...fv('date')} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Próxima Dosis" placeholder="YYYY-MM-DD" {...fv('nextDate')} /></View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FInput label="Veterinario" placeholder="Nombre" {...fv('vet')} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Lote/Batch" placeholder="Código" {...fv('batch')} /></View>
          </View>
          <FTextarea label="Notas" placeholder="Observaciones..." {...fv('notes')} />
          <View style={styles.modalButtons}>
            <Button variant="secondary" onPress={() => setShowV(false)}>Cancelar</Button>
            <Button onPress={addVaccine}>Registrar</Button>
          </View>
        </View>
      </Modal>

      {/* Document Modal */}
      <Modal isOpen={showD} onClose={() => setShowD(false)} title="Subir Documento">
        <View style={{ gap: 12 }}>
          <FInput label="Nombre del Documento" required placeholder="Ej: Análisis de Sangre" {...fd('name')} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}><FSelect label="Tipo" value={df.type} options={DOC_OPTS} onChange={v => setDf((p: any) => ({ ...p, type: v }))} /></View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}><FInput label="Fecha" placeholder="YYYY-MM-DD" {...fd('date')} /></View>
          </View>
          <FTextarea label="Notas" placeholder="Observaciones..." {...fd('notes')} />
          <View style={styles.modalButtons}>
            <Button variant="secondary" onPress={() => setShowD(false)}>Cancelar</Button>
            <Button onPress={addDoc}>Guardar</Button>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function SectionHeader({ icon, title, count, onAdd, addLabel, colors, style }: any) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>{title}</Text>
        <View style={{ backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{count}</Text>
        </View>
      </View>
      <Button size="sm" onPress={onAdd}>{addLabel}</Button>
    </View>
  )
}

function EmptySection({ icon, text, colors }: any) {
  return (
    <View style={[{ alignItems: 'center', padding: 28, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8 }, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
      <Ionicons name={icon} size={32} color={colors.textMuted} />
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14 },
  selectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  selectorText: { fontSize: 13, fontWeight: '600' },
  itemCard: { marginBottom: 10, borderRadius: RADIUS.md, borderWidth: 1, padding: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  itemIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  itemTitle: { fontWeight: '600', fontSize: 14 },
  itemMeta: { fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  overdueTag: { backgroundColor: '#FF6B6B18', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  overdueText: { fontSize: 10, color: '#FF6B6B', fontWeight: '700' },
  deleteBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
})