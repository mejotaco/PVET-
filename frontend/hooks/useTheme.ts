import { useColorScheme } from 'react-native'
import { DARK, LIGHT } from '../constants/theme'
import { useApp } from '../context/AppContext'

export function useTheme() {
  const scheme = useColorScheme()
  const { themeMode } = useApp()

  let isDark: boolean
  if (themeMode === 'system') {
    isDark = scheme === 'dark'
  } else {
    isDark = themeMode === 'dark'
  }

  return {
    colors: isDark ? DARK : LIGHT,
    isDark,
  }
}