/**
 * apps.linkedin.models's LinkedInAccount/LinkedInShare, via apps/linkedin/views.py
 * (LinkedInAccountViewSet, LinkedInShareViewSet) + apps/linkedin/serializers.py,
 * mounted at /api/linkedin/.
 */
export interface LinkedInAccount {
  id: number
  organization_urn: string
  organization_name: string
  has_access_token: boolean
  has_refresh_token: boolean
  token_expires_at: string | null
  token_expiring_soon: boolean
  refresh_token_expires_at: string | null
  refresh_token_expiring_soon: boolean
  scopes: string
  publishing_enabled: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type LinkedInShareStatus = 'pending' | 'publishing' | 'published' | 'failed' | 'skipped'

export interface LinkedInShare {
  id: number
  post_id: number
  status: LinkedInShareStatus
  linkedin_post_urn: string
  permalink: string
  error_code: string
  error_message: string
  published_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface LinkedInShareListParams {
  status?: LinkedInShareStatus
  page?: number
  page_size?: number
}
