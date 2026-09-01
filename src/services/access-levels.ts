import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type { AccessLevel, AccessLevelFormValues } from '@/types/access-level'

const BASE = '/api/auth/access-levels/'

export const accessLevelsApi = {
  // AccessLevelViewSet doesn't override pagination_class, so it inherits the global
  // TwentyPerPagePagination default — same {count, next, previous, results} shape as everywhere else.
  list() {
    return apiClient.get<PaginatedResponse<AccessLevel>>(BASE)
  },
  create(payload: AccessLevelFormValues) {
    return apiClient.post<AccessLevel>(BASE, payload)
  },
  update(id: number, payload: Partial<AccessLevelFormValues>) {
    return apiClient.patch<AccessLevel>(`${BASE}${id}/`, payload)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}${id}/`)
  },
  seedCrmPresets() {
    return apiClient.post<AccessLevel[]>(`${BASE}seed-crm-presets/`)
  },
}
