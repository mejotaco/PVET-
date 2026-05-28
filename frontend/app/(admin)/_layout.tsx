import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { StyleSheet, View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DARK, LIGHT } from '../../constants/theme'
import { useColorScheme } from '../../hooks/use-color-scheme'

const TAB_CONFIG = [
  { name: 'index',        icon: 'stats-chart',     label: 'Panel'    },
  { name: 'pets',         icon: 'paw',             label: 'Mascotas' },
  { name: 'appointments', icon: 'calendar',        label: 'Citas'    },
  { name: 'health',       icon: 'medkit',          label: 'Salud'    },
  { name: 'settings',     icon: 'settings',        label: 'Config'   },
]

export default function AdminTabsLayout() {
  const scheme = useColorScheme()
  const colors = scheme === 'dark' ? DARK : LIGHT
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.glassBorder,
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      {TAB_CONFIG.map(({ name, icon, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <Ionicons
                  name={focused ? icon : `${icon}-outline` as any}
                  size={22}
                  color={focused ? colors.teal : colors.textMuted}
                />
                <Text style={[
                  styles.tabLabel,
                  { color: focused ? colors.teal : colors.textMuted }
                ]}>
                  {label}
                </Text>
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    width: 56,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
})
