/**
 * Mirrors backend MyUser.Roles (apps/accounts/models.py) — written fresh, not ported from
 * superadmin-propulence's Angular user-role.enum.ts.
 */
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  BROKER = 'BROKER',
  AGENT = 'AGENT',
  OWNER = 'OWNER',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  TENANT = 'TENANT',
  BUILDER = 'BUILDER',
  DEVELOPER = 'DEVELOPER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
}

/**
 * The richest known shape — this is what SuperAdminTokenObtainPairSerializer.validate()
 * actually returns as the login response's `user` field (apps/accounts/views.py:101-113).
 * `is_superuser` is only ever populated from login; GET /me/ (see MeResponse below) never
 * returns it, so it stays whatever the last login set it to across a page reload.
 */
export interface AuthUser {
  id: number
  email: string
  full_name: string
  is_superuser?: boolean
  role: UserRole
}

export interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
}

/**
 * Real shape of GET /api/auth/me/ (MeSerializer, apps/accounts/serializers.py:51-64) — verified
 * against source after discovering it does NOT include full_name or is_superuser, unlike the
 * login response. Used only to rehydrate a session from a stored token on app boot; full_name is
 * derived client-side from first_name/last_name since the backend doesn't send it here.
 */
export interface MeResponse {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone: string | null
  is_phone_verified: boolean
  onboarding_complete: boolean
}

