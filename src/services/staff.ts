import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type { StaffUser, StaffCreateValues, StaffUpdateValues, StaffListParams } from '@/types/staff'

const BASE = '/api/auth/staff/'

export const staffApi = {
  list(params: StaffListParams = {}) {
    return apiClient.get<PaginatedResponse<StaffUser>>(BASE, { params })
  },
  get(id: number) {
    return apiClient.get<StaffUser>(`${BASE}${id}/`)
  },
  create(payload: StaffCreateValues) {
    return apiClient.post<StaffUser>(BASE, payload)
  },
  update(id: number, payload: StaffUpdateValues) {
    return apiClient.patch<StaffUser>(`${BASE}${id}/`, payload)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}${id}/`)
  },
  // Returns 204 No Content — no user object in the response, unlike deactivate.
  activate(id: number) {
    return apiClient.post<void>(`${BASE}${id}/activate/`)
  },
  deactivate(id: number) {
    return apiClient.post<StaffUser>(`${BASE}${id}/deactivate/`)
  },
  setRole(id: number, role: string) {
    return apiClient.post<StaffUser>(`${BASE}${id}/set-role/`, { role })
  },
}
