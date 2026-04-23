// hooks/useThemeColor.ts
import { DARK, LIGHT } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof LIGHT & keyof typeof DARK
) {
  const scheme = useColorScheme() ?? 'light'
  const colorFromProps = props[scheme]

  if (colorFromProps) {
    return colorFromProps
  }

  return scheme === 'dark' ? DARK[colorName] : LIGHT[colorName]
}