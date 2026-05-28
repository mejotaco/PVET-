import { useEffect, useRef, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Animated, Image, ImageBackground, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppProvider, useApp } from '../context/AppContext'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import LoginScreen from './login'

function Splash({ isDark }: { isDark: boolean }) {
  return (
    <ImageBackground
      source={
        isDark
          ? require('../assets/images/android-icon-background2.png')
          : require('../assets/images/android-icon-background.png')
      }
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      resizeMode="cover"
    >
      <Image
        source={
          isDark
            ? require('../assets/images/icon2.png')
            : require('../assets/images/icon.png')
        }
        style={{ width: 220, height: 220 }}
        resizeMode="contain"
      />
    </ImageBackground>
  )
}

function RootContent() {
  const { colors, isDark } = useTheme()
  const { loaded } = useApp()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [minTime, setMinTime] = useState(false)
  const [showApp, setShowApp] = useState(false)
  const splashOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const timer = setTimeout(() => setMinTime(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loaded && minTime && !authLoading) {
      Animated.timing(splashOpacity, {
        toValue: 0, duration: 400, useNativeDriver: true,
      }).start(() => setShowApp(true))
    }
  }, [loaded, minTime, authLoading])

  if (!showApp) {
    return (
      <Animated.View style={{ flex: 1, opacity: splashOpacity }}>
        <Splash isDark={isDark} />
      </Animated.View>
    )
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LoginScreen />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </View>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <RootContent />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
