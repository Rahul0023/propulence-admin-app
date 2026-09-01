import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useLogin } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth-store'
import type { AxiosError } from 'axios'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  if (isAuthenticated) {
    return <Navigate to={searchParams.get('return_url') || '/dashboard'} replace />
  }

  const errorMessage =
    (login.error as AxiosError<{ detail?: string; error?: string }> | null)?.response?.data?.detail ??
    (login.error as AxiosError<{ detail?: string; error?: string }> | null)?.response?.data?.error ??
    (login.error ? 'Login failed. Check your credentials.' : null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy to-navy-light p-4">
      <Card className="w-full max-w-sm shadow-luxury">
        <CardHeader className="space-y-1 text-center">
          <img src="/logo/short_logo.png" alt="Propulence" className="mx-auto mb-2 h-10 w-10 object-contain" />
          <CardTitle className="font-serif text-xl">Propulence Admin</CardTitle>
          <CardDescription>Sign in with your superadmin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              login.mutate({ email, password })
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" variant="accent" className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
