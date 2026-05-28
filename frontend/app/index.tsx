import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../context/AuthContext'

export default function Index() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === 'vet') {
      router.replace('/(admin)' as any)
    } else {
      router.replace('/(tabs)' as any)
    }
  }, [user])

  return null
}
