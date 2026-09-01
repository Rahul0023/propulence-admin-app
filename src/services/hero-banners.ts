import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type {
  AppHeroBanner,
  AppHeroBannerFormValues,
  AppHeroBannerListParams,
} from '@/types/hero-banner'

const BASE = '/api/home/hero-banners/'

/** image is an ImageField on the serializer — send multipart whenever a new file is picked,
 * JSON otherwise (DRF's ModelViewSet accepts both via its default parser classes). */
function toRequestBody(payload: Partial<AppHeroBannerFormValues>, image?: File | null) {
  if (!image) return payload
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value))
  })
  form.append('image', image)
  return form
}

export const heroBannersApi = {
  list(params: AppHeroBannerListParams = {}) {
    return apiClient.get<PaginatedResponse<AppHeroBanner>>(BASE, { params })
  },
  get(id: number) {
    return apiClient.get<AppHeroBanner>(`${BASE}${id}/`)
  },
  create(payload: Partial<AppHeroBannerFormValues>, image?: File | null) {
    const body = toRequestBody(payload, image)
    return apiClient.post<AppHeroBanner>(BASE, body, image ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },
  update(id: number, payload: Partial<AppHeroBannerFormValues>, image?: File | null) {
    const body = toRequestBody(payload, image)
    return apiClient.patch<AppHeroBanner>(`${BASE}${id}/`, body, image ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}${id}/`)
  },
}
