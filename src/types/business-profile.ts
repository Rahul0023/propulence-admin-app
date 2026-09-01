/**
 * Real shapes from apps/business_profiles/{models,serializers/business_profile_serializers,
 * views/views}.py, verified against source. RBAC allows SUPERADMIN/ADMIN full CRUD, STAFF
 * ("Manager") view+create only, AGENT ("Executive") CRUD on their own records only — but since
 * this app's login gate requires is_superuser=True, every session here already clears
 * is_bp_user()/is_bp_admin() unconditionally, so no client-side role gating is needed (matches
 * Properties/Projects/Developers, not the SUPERADMIN-role-only Users/Access Levels gate).
 */
export const BUSINESS_PROFILE_SOURCES = ['MANUAL', 'SCANNED'] as const

export interface BusinessProfileListItem {
  id: number
  full_name: string
  company_name: string
  designation: string
  phone: string
  email: string
  website: string
  city: string
  source: (typeof BUSINESS_PROFILE_SOURCES)[number]
  photo_url: string | null
  qr_png_url: string | null
  created_at: string
  created_by: number | null
}

export interface BusinessProfile {
  id: number
  full_name: string
  designation: string
  photo_url: string | null
  company_name: string
  department: string
  industry: string
  email: string
  phone: string
  alternate_phone: string
  fax: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  country: string
  pincode: string
  website: string
  linkedin_url: string
  twitter_url: string
  facebook_url: string
  instagram_url: string
  notes: string
  tags: string[]
  qr_png_url: string | null
  qr_svg_url: string | null
  source: (typeof BUSINESS_PROFILE_SOURCES)[number]
  created_by: number | null
  created_at: string
  updated_at: string
}

// WRITABLE_FIELDS in business_profile_serializers.py:138-162 — `photo` is a File, handled
// separately in the service layer (multipart only when a new file is actually selected).
export interface BusinessProfileFormValues {
  full_name: string
  designation?: string
  company_name?: string
  department?: string
  industry?: string
  email?: string
  phone?: string
  alternate_phone?: string
  fax?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  website?: string
  linkedin_url?: string
  twitter_url?: string
  facebook_url?: string
  instagram_url?: string
  notes?: string
  tags?: string[]
}

export interface BusinessProfileListParams {
  page?: number
  page_size?: number
  search?: string
  source?: string
  city?: string
  company_name?: string
}

// GET /api/business-profiles/stats/
export interface BusinessProfileStats {
  total: number
  manual: number
  scanned: number
  added_this_month: number
  qr_generated: number
}
