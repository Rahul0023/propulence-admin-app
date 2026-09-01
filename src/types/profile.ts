/**
 * Real shape from UserProfileSerializer (apps/accounts/serializers.py:239-254), via
 * MeProfileView (GET/PUT/PATCH /api/auth/me/profile/). `is_phone_verified`/`onboarding_complete`
 * are read-only. `role` is technically writable per the serializer but validate_role restricts
 * self-selection to a small consumer-facing set (OWNER/BUILDER/...) — not exposed here since role
 * changes for staff/admin accounts belong in the Users module (StaffViewSet.set_role), not self-edit.
 */
export interface Profile {
  full_name: string
  first_name: string
  last_name: string
  role: string
  email: string
  phone: string | null
  is_phone_verified: boolean
  onboarding_complete: boolean
}

export type ProfileUpdateValues = Pick<Profile, 'full_name' | 'first_name' | 'last_name' | 'phone'>
