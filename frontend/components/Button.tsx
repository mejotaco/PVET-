import React from 'react'
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native'
import { RADIUS } from '../constants/theme'
import { useTheme } from '../hooks/useTheme'

interface ButtonProps {
  children: React.ReactNode
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  style?: ViewStyle
}

export default function Button({ children, onPress, variant = 'primary', size = 'md', disabled, style }: ButtonProps) {
  const { colors, isDark } = useTheme()

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
      boxShadow: `0 4px 8px ${colors.primary}59`,
      elevation: 4,
    },
    secondary: {
      backgroundColor: isDark ? colors.glass : colors.surface,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    danger: {
      backgroundColor: '#FF6B6B15',
      borderWidth: 1,
      borderColor: '#FF6B6B40',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  }

  const textColors: Record<string, string> = {
    primary: '#FFFFFF',
    secondary: colors.textPrimary,
    danger: '#FF6B6B',
    ghost: colors.textSecondary,
  }

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: 14, paddingVertical: 7 },
    md: { paddingHorizontal: 20, paddingVertical: 11 },
    lg: { paddingHorizontal: 26, paddingVertical: 14 },
  }

  const textSizes: Record<string, number> = {
    sm: 13, md: 14, lg: 16,
  }

  return (
    <TouchableOpacity
      onPress={!disabled ? onPress : undefined}
      activeOpacity={0.8}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabled,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[
          styles.text,
          { color: textColors[variant], fontSize: textSizes[size] } as TextStyle,
        ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '600' },
})
