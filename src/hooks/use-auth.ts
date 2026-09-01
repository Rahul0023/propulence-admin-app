import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/services/auth'
import { authStorage } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth-store'

export function useLogin() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: ({ data }) => {
      authStorage.set({ access: data.access, refresh: data.refresh })
      setUser(data.user)
      navigate('/dashboard', { replace: true })
    },
  })
}

/**
 * Fetches GET /api/auth/me/ and hydrates auth-store — used on app boot to validate a stored
 * token still works (e.g. after a page reload with no in-memory user yet). MeSerializer doesn't
 * return full_name or is_superuser (see types/auth.ts's MeResponse doc comment), so this merges
 * onto whatever's already in the store rather than overwriting it — full_name falls back to
 * first_name + last_name, is_superuser is left untouched (only `role` drives any gating logic).
 */
export function useMe(enabled: boolean) {
  const setUser = useAuthStore((s) => s.setUser)
  const existingUser = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await authApi.me()
      setUser({
        id: data.id,
        email: data.email,
        full_name: existingUser?.full_name || `${data.first_name} ${data.last_name}`.trim() || data.email,
        is_superuser: existingUser?.is_superuser,
        role: data.role,
      })
      return data
    },
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)

  return () => {
    const auth = authStorage.get()
    if (auth?.refresh) {
      authApi.logout(auth.refresh).catch(() => {
        /* best-effort — client-side session is cleared regardless */
      })
    }
    logout()
    queryClient.clear()
    navigate('/login', { replace: true })
  }
}
