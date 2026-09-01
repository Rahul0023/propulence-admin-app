/**
 * Core fields from apps/developer/models.py's Developer model. Slug-keyed (not id) on the CRM
 * endpoints — CRMDeveloperViewSet uses lookup_field="slug".
 */
export interface Developer {
  id: number
  slug: string
  name: string
  company_name: string
  website: string | null
  logo_url: string | null
  cover_image_url: string | null
  established_year: number | null
  total_projects: number
  upcoming_projects: number
  completed_projects: number
  under_construction_projects: number
  description: string
  phone: string
  email: string
  city: string | null
  state: string | null
  country: string | null
  is_verified: boolean
  is_published: boolean
  is_active: boolean
  rera_id: string | null
  rera_verified: boolean
  created_at: string
  updated_at: string
}

export interface DeveloperCreateValues {
  name: string
  company_name: string
  phone?: string
  email?: string
  city?: string
  country?: string
}

export type DeveloperUpdateValues = Partial<DeveloperCreateValues>

export interface DeveloperListParams {
  page?: number
  page_size?: number
  search?: string
}
