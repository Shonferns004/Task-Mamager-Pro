import { createContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import type { User as AppUser } from '../types'
import { api } from '../lib/api'

interface AuthContextType {
  userId: string | null
  profile: AppUser | null
  loading: boolean
  isAdmin: boolean
  signOut: () => void
}

export const AuthContext = createContext<AuthContextType>({
  userId: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { userId: clerkUserId, isLoaded, isSignedIn, signOut } = useClerkAuth()
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || !clerkUserId) {
      setProfile(null)
      setLoading(false)
      return
    }

    api.syncUser()
      .then((data) => setProfile(data.user))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [isLoaded, isSignedIn, clerkUserId])

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ userId: clerkUserId, profile, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
