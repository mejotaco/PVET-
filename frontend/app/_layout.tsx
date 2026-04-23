import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DARK, LIGHT } from '../constants/theme'
import { AppProvider } from '../context/AppContext'

export default function RootLayout() {
  const scheme = useColorScheme()
  const colors = scheme === 'dark' ? DARK : LIGHT

  return (
    <SafeAreaProvider>
      <AppProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </AppProvider>
    </SafeAreaProvider>
  )
}