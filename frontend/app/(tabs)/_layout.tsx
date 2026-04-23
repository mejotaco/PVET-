import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { StyleSheet, useColorScheme, View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DARK, LIGHT } from '../../constants/theme'

const TAB_CONFIG = [
  { name: 'index',        icon: 'home',     iconOut: 'home-outline',     label: 'Inicio'  },
  { name: 'pets',         icon: 'paw',      iconOut: 'paw-outline',      label: 'Mascotas'},
  { name: 'appointments', icon: 'calendar', iconOut: 'calendar-outline', label: 'Citas'   },
  { name: 'health',       icon: 'medkit',   iconOut: 'medkit-outline',   label: 'Salud'   },
  { name: 'settings',     icon: 'settings', iconOut: 'settings-outline', label: 'Config'  },
]

function TabIcon({
  name, focused, colors, label,
}: {
  name: any; focused: boolean; colors: typeof LIGHT; label: string
}) {
  return (
    <View style={[styles.iconWrapper, focused && { backgroundColor: colors.primary + '1A' }]}>
      <Ionicons
        name={name}
        size={20}
        color={focused ? colors.primary : colors.textMuted}
      />
      {focused && (
        <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
      )}
    </View>
  )
}

export default function TabsLayout() {
  const scheme = useColorScheme()
  const colors  = scheme === 'dark' ? DARK : LIGHT
  const isDark  = scheme === 'dark'
  const insets  = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom > 0 ? insets.bottom + 4 : 14,
          marginHorizontal: 20,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderRadius: 28,
          height: 64,
          paddingTop: 10,
          paddingBottom: 10,
          // Refined shadow system
          shadowColor: isDark ? '#000' : '#1A1A2E',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.5 : 0.14,
          shadowRadius: 28,
          elevation: 20,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      {TAB_CONFIG.map(({ name, icon, iconOut, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? icon : iconOut}
                focused={focused}
                colors={colors}
                label={label}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 46,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 5,
  },
})
