import { Ionicons } from '@expo/vector-icons'
import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RADIUS } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { findAnswer } from '../../constants/faq'

interface Message {
  role: 'user' | 'bot'
  text: string
}

const SUGGESTIONS = [
  '¿Cada cuánto debo vacunar a mi perro?',
  '¿Qué síntomas son emergencia?',
  '¿Qué comida es tóxica para gatos?',
  '¿Cada cuánto desparasitar?',
]

export default function ChatScreen() {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '¡Hola! Soy PVetBot, tu asistente veterinario. Pregúntame sobre cuidados, salud, alimentación, vacunas y más.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages])

  const sendMessage = (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    if (!text) setInput('')

    const userMsg: Message = { role: 'user', text: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    setTimeout(() => {
      const answer = findAnswer(msg)

      if (answer) {
        setMessages(prev => [...prev, { role: 'bot', text: answer }])
      } else {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: 'No tengo una respuesta exacta para eso. Intenta preguntar sobre: vacunas, desparasitación, alimentación, síntomas, higiene, ejercicio, comportamiento, o emergencias. Si es urgente, contacta a tu veterinario.'
        }])
      }

      setLoading(false)
    }, 600)
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user'
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="chatbubble-ellipses" size={14} color="#fff" />
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.botBubble, { backgroundColor: isDark ? '#1E2638' : '#FFFFFF', borderColor: colors.glassBorder }]
        ]}>
          <Text style={[
            styles.bubbleText,
            { color: isUser ? '#fff' : colors.textPrimary }
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.glassBorder }]}>
        <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>PVetBot</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Asistente veterinario</Text>
        </View>
        {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 'auto' }} />}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          messages.length === 1 ? (
            <View style={styles.suggestions}>
              <Text style={[styles.suggestionsLabel, { color: colors.textMuted }]}>Preguntas frecuentes:</Text>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
                  onPress={() => sendMessage(s)}
                  disabled={loading}
                >
                  <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.glassBorder }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.glassBorder }]}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu consulta..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() && !loading ? colors.primary : colors.glassBorder }]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={16} color={input.trim() && !loading ? '#fff' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 11 },

  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start', gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.md },
  userBubble: { borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 15, lineHeight: 21 },

  suggestions: { marginTop: 8, gap: 8 },
  suggestionsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  suggestionChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.sm, borderWidth: 1 },
  suggestionText: { fontSize: 13 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1,
  },
  input: {
    flex: 1, borderWidth: 1, borderRadius: RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
})
