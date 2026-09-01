import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type {
  SpotliteProject,
  SpotliteProjectFormValues,
  SpotliteProjectListParams,
} from '@/types/spotlight-project'

const BASE = '/api/home/spotlite-projects/'

/** thumbnail is an ImageField on the serializer — send multipart whenever a new file is picked,
 * JSON otherwise (DRF's ModelViewSet accepts both via its default parser classes). */
function toRequestBody(payload: Partial<SpotliteProjectFormValues>, thumbnail?: File | null) {
  if (!thumbnail) return payload
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value))
  })
  form.append('thumbnail', thumbnail)
  return form
}

export const spotlightProjectsApi = {
  list(params: SpotliteProjectListParams = {}) {
    return apiClient.get<PaginatedResponse<SpotliteProject>>(BASE, { params })
  },
  get(id: number) {
    return apiClient.get<SpotliteProject>(`${BASE}${id}/`)
  },
  create(payload: Partial<SpotliteProjectFormValues>, thumbnail?: File | null) {
    const body = toRequestBody(payload, thumbnail)
    return apiClient.post<SpotliteProject>(BASE, body, thumbnail ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },
  update(id: number, payload: Partial<SpotliteProjectFormValues>, thumbnail?: File | null) {
    const body = toRequestBody(payload, thumbnail)
    return apiClient.patch<SpotliteProject>(`${BASE}${id}/`, body, thumbnail ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}${id}/`)
  },
}
