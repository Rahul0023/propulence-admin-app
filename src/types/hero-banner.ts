/**
 * apps/home/models.py's AppHeroBanner model, via CRMAppHeroBannerViewSet
 * (apps/home/views/crm_views.py) + AppHeroBannerSerializer (apps/home/serializers/hero_banners.py).
 *
 * Server-side validation (AppHeroBannerSerializer.validate): start_date/end_date must both be set
 * or both empty; end_date must be on/after start_date.
 */
export interface AppHeroBanner {
  id: number
  title: string
  subtitle: string
  image: string | null
  cta_label: string
  cta_url: string
  sort_order: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export type AppHeroBannerFormValues = Pick<
  AppHeroBanner,
  'title' | 'subtitle' | 'cta_label' | 'cta_url' | 'sort_order' | 'is_active' | 'start_date' | 'end_date'
>

export interface AppHeroBannerListParams {
  page?: number
  page_size?: number
  search?: string
  is_active?: boolean
}
