import { Ionicons } from '@expo/vector-icons'
import React, { useState, useEffect } from 'react'
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RADIUS } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { api } from '../../context/api'

interface Pet { id: number; name: string; species: string | null }
interface HealthRecord { id: number; petId: number; date: string; type: string; description: string; vetName: string | null }
interface Vaccination { id: number; petId: number; name: string; dateApplied: string; nextDue: string | null; vetName: string | null }

export default function AdminHealth() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<number | null>(null)
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [vaccines, setVaccines] = useState<Vaccination[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const p = await api.getPets()
        setPets(p)
        if (p.length > 0) setSelectedPet(p[0].id)
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  useEffect(() => {
    if (!selectedPet) return
    (async () => {
      try {
        const [r, v] = await Promise.all([
          api.getHealthRecordsByPet(selectedPet),
          api.getVaccinations(selectedPet),
        ])
        setRecords(r)
        setVaccines(v)
      } catch {}
    })()
  }, [selectedPet])

  const selectedPetData = pets.find(p => p.id === selectedPet)

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.glassBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Salud</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>Historial clínico</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petStrip} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {pets.map(p => (
              <TouchableOpacity key={p.id} onPress={() => setSelectedPet(p.id)}
                style={[styles.petChip, {
                  backgroundColor: selectedPet === p.id ? colors.teal + '20' : colors.surface,
                  borderColor: selectedPet === p.id ? colors.teal : colors.glassBorder,
                }]}>
                <Text style={[styles.petChipText, { color: selectedPet === p.id ? colors.teal : colors.textSecondary }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
            {selectedPetData && (
              <Text style={[styles.petName, { color: colors.textPrimary }]}>
                {selectedPetData.name}
              </Text>
            )}

            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>VACUNAS</Text>
            {vaccines.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin vacunas registradas</Text>
            ) : (
              vaccines.map(v => (
                <View key={v.id} style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <View style={[styles.recordIcon, { backgroundColor: colors.success + '15' }]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recordName, { color: colors.textPrimary }]}>{v.name}</Text>
                    <Text style={[styles.recordMeta, { color: colors.textMuted }]}>
                      Aplicada: {v.dateApplied || '—'}{v.nextDue ? ` · Próxima: ${v.nextDue}` : ''}
                    </Text>
                    {v.vetName && <Text style={[styles.recordMeta, { color: colors.textMuted }]}>por {v.vetName}</Text>}
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>REGISTROS DE SALUD</Text>
            {records.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin registros de salud</Text>
            ) : (
              records.map(r => (
                <View key={r.id} style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
                  <View style={[styles.recordIcon, { backgroundColor: colors.teal + '15' }]}>
                    <Ionicons name="medkit-outline" size={18} color={colors.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recordName, { color: colors.textPrimary }]}>{r.type || 'Sin tipo'}</Text>
                    <Text style={[styles.recordMeta, { color: colors.textMuted }]}>
                      {r.date || '—'} {r.description ? `· ${r.description}` : ''}
                    </Text>
                    {r.vetName && <Text style={[styles.recordMeta, { color: colors.textMuted }]}>por {r.vetName}</Text>}
                  </View>
                </View>
              ))
            )}

            {pets.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay mascotas registradas</Text>
            )}
          </ScrollView>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, marginTop: 2 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  petStrip: { paddingVertical: 12, maxHeight: 52 },
  petChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  petChipText: { fontSize: 13, fontWeight: '700' },

  petName: { fontSize: 20, fontWeight: '800', marginBottom: 16 },

  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },

  recordCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: 8,
  },
  recordIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recordName: { fontSize: 14, fontWeight: '700' },
  recordMeta: { fontSize: 11, marginTop: 1, lineHeight: 16 },

  emptyText: { textAlign: 'center', paddingVertical: 24, fontSize: 13 },
})
