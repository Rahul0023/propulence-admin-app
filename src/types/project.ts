/**
 * Core fields from apps/project/models.py's Project model, via ProjectViewSet
 * (apps/crm/views/views.py:976-1210). `developer` is a required FK (on_delete=CASCADE) — the
 * form needs a developer picker, not a free-text field.
 */
export const PROJECT_TYPES = ['residential', 'commercial', 'mixed_use', 'plotted'] as const
export const PROJECT_STATUS = [
  'planning',
  'upcoming',
  'under_construction',
  'ready_to_move',
  'completed',
  'delayed',
] as const

export interface Project {
  id: number
  developer: number
  developer_name?: string
  name: string
  slug: string | null
  short_description: string | null
  description: string | null
  project_type: (typeof PROJECT_TYPES)[number]
  status: (typeof PROJECT_STATUS)[number]
  min_price: string | null
  max_price: string | null
  min_price_per_sqft: string | null
  max_price_per_sqft: string | null
  total_units: number | null
  possession_date: string | null
  rera_number: string | null
  rera_registration_date: string | null
  rera_authority: string | null
  location: string | null
  is_published: boolean
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProjectFormValues = Pick<
  Project,
  | 'developer'
  | 'name'
  | 'short_description'
  | 'description'
  | 'project_type'
  | 'status'
  | 'min_price'
  | 'max_price'
  | 'total_units'
  | 'location'
  | 'rera_number'
  | 'rera_authority'
>

export interface ProjectListParams {
  page?: number
  page_size?: number
  search?: string
  status?: string
}
