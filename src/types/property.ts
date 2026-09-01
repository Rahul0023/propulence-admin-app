/**
 * Core fields from apps/property/models.py's Property model, as exposed by CRMPropertySerializer
 * (apps/crm/serializers.py:146, fields = "__all__"). Not exhaustive — the model has 80+ fields
 * (AI enrichment, quality scoring, etc.); this covers what the admin CRUD form actually edits.
 * city/locality/postal_code are editable=False FKs on the model (geocoded, not form-settable) —
 * intentionally omitted from the write shape.
 */
export const LISTING_TYPES = ['sale', 'rent', 'lease', 'pg'] as const
export const PROPERTY_TYPES = [
  'apartment',
  'villa',
  'plot',
  'independent_house',
  'commercial',
  'office',
  'shop',
  'warehouse',
] as const
export const PROPERTY_STATUS = ['available', 'sold', 'rented', 'under_offer'] as const

export interface Property {
  id: number
  title: string | null
  slug_name: string | null
  description: string | null
  listing_type: (typeof LISTING_TYPES)[number]
  property_type: (typeof PROPERTY_TYPES)[number]
  status: (typeof PROPERTY_STATUS)[number]
  price: string | null
  price_per_sqft: string | null
  builtup_area_sqft: string | null
  bedrooms: number | null
  bathrooms: number | null
  formatted_address: string | null
  latitude: string | null
  longitude: string | null
  is_verified: boolean
  is_published: boolean
  is_featured: boolean
  is_active: boolean
  views_count: number
  created_at: string
  updated_at: string
}

export type PropertyFormValues = Pick<
  Property,
  | 'title'
  | 'description'
  | 'listing_type'
  | 'property_type'
  | 'status'
  | 'price'
  | 'builtup_area_sqft'
  | 'bedrooms'
  | 'bathrooms'
  | 'formatted_address'
>

export interface PropertyListParams {
  page?: number
  page_size?: number
  search?: string
  listing_type?: string
  property_type?: string
  status?: string
}
