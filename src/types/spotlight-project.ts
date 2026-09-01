/**
 * apps/home/models.py's SpotliteProject model, via CRMSpotliteProjectViewSet
 * (apps/home/views/crm_views.py) + SpotliteProjectSerializer (apps/home/serializers/projects.py).
 * This is the live backing data for propulence/'s home-page "promoted" project rotator
 * (apps/home/views/views.py HomeProjectsView, ?type=promoted) — not a redundant concept next to
 * Project.is_featured, which drives a separate "featured" section.
 *
 * Server-side validation (SpotliteProjectSerializer.validate): week_start/week_end must both be
 * set or both empty; week_end must be on/after week_start; at most 5 active rows may overlap a
 * given week window (raises a "non_field_errors" ValidationError, not a per-field one).
 */
export interface SpotliteProject {
  id: number
  project: number
  project_name: string
  project_slug: string | null
  title: string | null
  subtitle: string | null
  thumbnail: string | null
  sort_order: number
  week_start: string | null
  week_end: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SpotliteProjectFormValues = Pick<
  SpotliteProject,
  'project' | 'title' | 'subtitle' | 'sort_order' | 'week_start' | 'week_end' | 'is_active'
>

export interface SpotliteProjectListParams {
  page?: number
  page_size?: number
  search?: string
  is_active?: boolean
}
