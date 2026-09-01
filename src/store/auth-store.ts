import { create } from 'zustand'
import type { AuthUser } from '@/types/auth'
import { authStorage } from '@/lib/api-client'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  setUser: (user: AuthUser | null) => void
  setHydrated: (v: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  logout: () => {
    authStorage.clear()
    set({ user: null, isAuthenticated: false })
  },
}))
