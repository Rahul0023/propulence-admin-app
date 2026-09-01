/**
 * Real shape from AccessLevelSerializer (apps/accounts/serializers.py:66-75). The entire
 * capability model is these 4 booleans — do not invent more.
 */
export interface AccessLevel {
  id: number
  name: string
  description: string
  can_view_reports: boolean
  can_manage_users: boolean
  can_edit_properties: boolean
  can_approve_listings: boolean
  created_at: string
  updated_at: string
}

export type AccessLevelFormValues = Pick<
  AccessLevel,
  'name' | 'description' | 'can_view_reports' | 'can_manage_users' | 'can_edit_properties' | 'can_approve_listings'
>
