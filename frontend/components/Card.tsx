import React from 'react'
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import { RADIUS } from '../constants/theme'
import { useTheme } from '../hooks/useTheme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  glow?: boolean
  variant?: 'default' | 'elevated' | 'glass' | 'outline'
}

export default function Card({ children, style, onPress, glow, variant = 'default' }: CardProps) {
  const { colors, isDark } = useTheme()

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
      elevation: isDark ? 4 : 2,
    },
    elevated: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
      elevation: isDark ? 8 : 4,
    },
    glass: {
      backgroundColor: colors.glass,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
      elevation: 2,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
  }

  const glowStyle: ViewStyle = glow ? {
    borderColor: colors.primary,
    boxShadow: `0 0 14px ${colors.primary}59`,
    elevation: 10,
  } : {}

  const content = (
    <View style={[styles.card, variantStyles[variant], glowStyle, style]}>
      {children}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ borderRadius: RADIUS.md }}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md,
    padding: 20,
    overflow: 'hidden',
  },
})
