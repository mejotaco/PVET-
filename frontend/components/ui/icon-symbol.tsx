import { Ionicons } from '@expo/vector-icons'

export type IconSymbolName = React.ComponentProps<typeof Ionicons>['name']

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName
  size?: number
  color: string
  style?: any
}) {
  return <Ionicons name={name} size={size} color={color} style={style} />
}
