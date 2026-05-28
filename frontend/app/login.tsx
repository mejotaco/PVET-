import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../context/AuthContext'
import { RADIUS } from '../constants/theme'

export default function LoginScreen() {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Ingresa tu correo y contraseña')
      return
    }
    setLoading(true)
    try {
      await login(email.trim(), password.trim())
    } catch (e: any) {
      Alert.alert('Error', 'Credenciales inválidas. Verifica tus datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <View style={styles.headerSection}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name="paw" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            <Text style={{ color: colors.primary }}>P</Text>Vet
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Inicia sesión para continuar
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Contraseña</Text>
          <View style={styles.pwRow}>
            <TextInput
              style={[styles.input, styles.pwInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPw(!showPw)}
              style={[styles.pwToggle, { backgroundColor: colors.background, borderColor: colors.glassBorder }]}
            >
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.loginBtnText}>Iniciar sesión</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.credentials}>
          <Text style={[styles.credLabel, { color: colors.textMuted }]}>Credenciales de prueba:</Text>
          <TouchableOpacity onPress={() => { setEmail('juan@ejemplo.com'); setPassword('owner123') }}>
            <Text style={[styles.credItem, { color: colors.primary }]}>Dueño: juan@ejemplo.com / owner123</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setEmail('vet@ejemplo.com'); setPassword('vet123') }}>
            <Text style={[styles.credItem, { color: colors.teal }]}>Veterinario: vet@ejemplo.com / vet123</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  logoWrap: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 14, marginTop: 6, fontWeight: '500' },

  formCard: {
    width: '100%', borderRadius: RADIUS.lg, borderWidth: 1,
    padding: 22, gap: 6,
  },
  inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  pwRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  pwInput: { flex: 1 },
  pwToggle: { width: 48, height: 48, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: RADIUS.md, marginTop: 20,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  credentials: { marginTop: 32, alignItems: 'center', gap: 8 },
  credLabel: { fontSize: 11, fontWeight: '600' },
  credItem: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
})
