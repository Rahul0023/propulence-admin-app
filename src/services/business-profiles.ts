import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type {
  BusinessProfile,
  BusinessProfileListItem,
  BusinessProfileFormValues,
  BusinessProfileListParams,
  BusinessProfileStats,
} from '@/types/business-profile'

const BASE = '/api/business-profiles/'

/**
 * `photo` is a real writable field on the create/update serializers, not a separate upload
 * action (unlike Developers' logo/cover). Build multipart only when a new file was actually
 * selected — sending it on every save would risk clobbering an existing photo with nothing, and
 * plain JSON is simpler/cheaper for the common case of editing text fields only. `tags` is a
 * JSONField; DRF's JSONField.to_internal_value accepts a JSON string over multipart, so it's
 * safe to JSON.stringify it when a FormData payload is needed.
 */
function buildPayload(values: Partial<BusinessProfileFormValues>, photo?: File | null) {
  if (!photo) return values

  const form = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return
    form.append(key, key === 'tags' ? JSON.stringify(value) : String(value))
  })
  form.append('photo', photo)
  return form
}

export const businessProfilesApi = {
  list(params: BusinessProfileListParams = {}) {
    return apiClient.get<PaginatedResponse<BusinessProfileListItem>>(BASE, { params })
  },
  get(id: number) {
    return apiClient.get<BusinessProfile>(`${BASE}${id}/`)
  },
  create(values: BusinessProfileFormValues, photo?: File | null) {
    const payload = buildPayload(values, photo)
    return apiClient.post<BusinessProfile>(BASE, payload, {
      headers: photo ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
  },
  update(id: number, values: Partial<BusinessProfileFormValues>, photo?: File | null) {
    const payload = buildPayload(values, photo)
    return apiClient.patch<BusinessProfile>(`${BASE}${id}/`, payload, {
      headers: photo ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
  },
  // Soft delete server-side (is_active=False) — the list/detail queryset already filters
  // is_active=True, so this behaves like a real delete from the frontend's perspective.
  remove(id: number) {
    return apiClient.delete(`${BASE}${id}/`)
  },
  regenerateQr(id: number) {
    return apiClient.post<BusinessProfile>(`${BASE}${id}/regenerate-qr/`)
  },
  vcardPath(id: number) {
    return `${BASE}${id}/vcard/`
  },
  stats() {
    return apiClient.get<BusinessProfileStats>(`${BASE}stats/`)
  },
}
