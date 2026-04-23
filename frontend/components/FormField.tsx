import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'
import { RADIUS } from '../constants/theme'
import { useTheme } from '../hooks/useTheme'

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
}

export function Field({ label, required, children }: FieldProps) {
  const { colors } = useTheme()
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}{required && <Text style={{ color: colors.primary }}> *</Text>}
      </Text>
      {children}
    </View>
  )
}

interface InputProps extends TextInputProps {
  label: string
  required?: boolean
}

export function FInput({ label, required, ...props }: InputProps) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <Field label={label} required={required}>
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primary : colors.glassBorder,
            color: colors.textPrimary,
          },
          props.style as any,
        ]}
      />
    </Field>
  )
}

interface SelectProps {
  label: string
  required?: boolean
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
}

export function FSelect({ label, required, value, options, onChange }: SelectProps) {
  const { colors } = useTheme()
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <Field label={label} required={required}>
      <View style={{ zIndex: open ? 999 : 1 }}>
        <TouchableOpacity
          onPress={() => setOpen(!open)}
          style={[
            styles.input,
            styles.selectBox,
            {
              backgroundColor: colors.surface,
              borderColor: open ? colors.primary : colors.glassBorder,
            },
          ]}
        >
          <Text style={{ color: selected ? colors.textPrimary : colors.textMuted, fontSize: 14, flex: 1 }}>
            {selected?.label || 'Seleccionar...'}
          </Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
        </TouchableOpacity>

        {open && (
          <View style={[styles.dropdown, {
            backgroundColor: colors.surface,
            borderColor: colors.glassBorder,
          }]}>
            <ScrollView bounces={false} nestedScrollEnabled style={{ maxHeight: 200 }}>
              {options.map((opt, i) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { onChange(opt.value); setOpen(false) }}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: colors.glassBorder },
                    i === options.length - 1 && { borderBottomWidth: 0 },
                    opt.value === value && { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <Text style={{
                    color: opt.value === value ? colors.primary : colors.textPrimary,
                    fontSize: 14,
                    fontWeight: opt.value === value ? '600' : '400',
                    flex: 1,
                  }}>
                    {opt.label}
                  </Text>
                  {opt.value === value && (
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Field>
  )
}

interface TextareaProps extends TextInputProps {
  label: string
  required?: boolean
}

export function FTextarea({ label, required, ...props }: TextareaProps) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <Field label={label} required={required}>
      <TextInput
        {...props}
        multiline
        numberOfLines={4}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          styles.textarea,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primary : colors.glassBorder,
            color: colors.textPrimary,
          },
        ]}
      />
    </Field>
  )
}

const styles = StyleSheet.create({
  field: { gap: 6, marginBottom: 4 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: 12,
    fontSize: 14,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
})