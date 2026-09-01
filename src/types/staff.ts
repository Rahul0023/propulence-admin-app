import type { UserRole } from '@/types/auth'
import type { AccessLevel } from '@/types/access-level'

/**
 * Real shape from MyUserListSerializer / MyUserWriteSerializer (apps/accounts/serializers.py:77-150),
 * via StaffViewSet (/api/auth/staff/). List responses include nested access_levels (read-only);
 * writes use access_level_ids (PK array) instead. `activate` returns 204 No Content — no body.
 * If `password` is omitted on create, the backend auto-generates `{firstname}@123`.
 */
export interface StaffUser {
  id: number
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  is_active: boolean
  is_staff: boolean
  access_levels: AccessLevel[]
  date_joined: string
  updated_at: string
}

export interface StaffCreateValues {
  email: string
  full_name: string
  phone?: string
  role: UserRole
  password?: string
  access_level_ids?: number[]
}

export type StaffUpdateValues = Partial<StaffCreateValues>

export interface StaffListParams {
  page?: number
  page_size?: number
  search?: string
  roles?: string
}
