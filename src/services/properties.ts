import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type { Property, PropertyFormValues, PropertyListParams } from '@/types/property'

const BASE = '/api/crm/properties/'

export const propertiesApi = {
  list(params: PropertyListParams = {}) {
    return apiClient.get<PaginatedResponse<Property>>(BASE, { params })
  },
  get(id: number) {
    return apiClient.get<Property>(`${BASE}${id}/`)
  },
  create(payload: Partial<PropertyFormValues>) {
    return apiClient.post<Property>(BASE, payload)
  },
  update(id: number, payload: Partial<PropertyFormValues>) {
    return apiClient.patch<Property>(`${BASE}${id}/`, payload)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}${id}/`)
  },
  toggleVerify(id: number) {
    return apiClient.post<Property>(`${BASE}${id}/toggle-verify/`)
  },
  togglePublish(id: number) {
    return apiClient.post<Property>(`${BASE}${id}/toggle-publish/`)
  },
  toggleFeatured(id: number) {
    return apiClient.post<Property>(`${BASE}${id}/toggle-featured/`)
  },
  // GET /api/crm/properties-download/ — only bulk operation that exists; there is no import.
  DOWNLOAD_PATH: '/api/crm/properties-download/',
}
