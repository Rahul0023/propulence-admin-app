import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authStorage } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth-store'
import { useMe } from '@/hooks/use-auth'
import { LoadingState } from '@/components/LoadingState'

export function RequireAuth() {
  const location = useLocation()
  const hasToken = !!authStorage.get()?.access
  const { isAuthenticated, isHydrated, setHydrated } = useAuthStore()
  const { isFetched, isError } = useMe(hasToken && !isHydrated)

  useEffect(() => {
    if (!hasToken || isFetched || isError) setHydrated(true)
  }, [hasToken, isFetched, isError, setHydrated])

  if (!hasToken) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?return_url=${returnUrl}`} replace />
  }

  if (!isHydrated) {
    return <LoadingState label="Checking your session…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

/** Gate for Users / Access Levels — backend enforces via IsSuperAdminRole (role, not is_superuser). */
export function RequireSuperAdminRole() {
  const user = useAuthStore((s) => s.user)

  if (user && user.role !== 'SUPERADMIN') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-12 text-center">
        <h2 className="text-lg font-semibold">Insufficient role</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          This section requires the SUPERADMIN business role. Your account is signed in as{' '}
          {user.role}, which the backend does not permit here.
        </p>
      </div>
    )
  }

  return <Outlet />
}
