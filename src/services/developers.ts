import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type { Developer, DeveloperCreateValues, DeveloperUpdateValues, DeveloperListParams } from '@/types/developer'

const BASE = '/api/crm/developers/'

export const developersApi = {
  list(params: DeveloperListParams = {}) {
    return apiClient.get<PaginatedResponse<Developer>>(BASE, { params })
  },
  get(slug: string) {
    return apiClient.get<Developer>(`${BASE}${slug}/`)
  },
  create(payload: DeveloperCreateValues) {
    return apiClient.post<Developer>(BASE, payload)
  },
  update(slug: string, payload: DeveloperUpdateValues) {
    return apiClient.patch<Developer>(`${BASE}${slug}/`, payload)
  },
  remove(slug: string) {
    return apiClient.delete(`${BASE}${slug}/`)
  },
  togglePublish(slug: string) {
    return apiClient.post<Developer>(`${BASE}${slug}/toggle-publish/`)
  },
  uploadImages(slug: string, files: { logo?: File; cover_image?: File }) {
    const form = new FormData()
    if (files.logo) form.append('logo', files.logo)
    if (files.cover_image) form.append('cover_image', files.cover_image)
    return apiClient.post(`${BASE}${slug}/upload-images/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  BULK_UPLOAD_PATH: '/api/crm/developers-upload/',
  BULK_DOWNLOAD_PATH: '/api/crm/developers-download/',
  bulkUpload(file: File) {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post(developersApi.BULK_UPLOAD_PATH, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
