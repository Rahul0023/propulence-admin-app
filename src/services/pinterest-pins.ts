import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type { PinterestPin, PinterestPinListParams, PinterestVideoUploadResponse } from '@/types/pinterest'

const BASE = '/api/pinterest/crm/pins/'

export interface PinterestVideoUploadPayload {
  project_id: number
  board_id?: string
  title?: string
  description?: string
  link?: string
  video_file: File
  cover_image: File
}

function toUploadFormData(payload: PinterestVideoUploadPayload) {
  const form = new FormData()
  form.append('project_id', String(payload.project_id))
  if (payload.board_id) form.append('board_id', payload.board_id)
  if (payload.title) form.append('title', payload.title)
  if (payload.description) form.append('description', payload.description)
  if (payload.link) form.append('link', payload.link)
  form.append('video_file', payload.video_file)
  form.append('cover_image', payload.cover_image)
  return form
}

export const pinterestPinsApi = {
  list(params: PinterestPinListParams = {}) {
    return apiClient.get<PaginatedResponse<PinterestPin>>(BASE, { params })
  },
  get(id: number) {
    return apiClient.get<PinterestPin>(`${BASE}${id}/`)
  },
  retry(id: number) {
    return apiClient.post<{ status: string; task_id: string }>(`${BASE}${id}/retry/`)
  },
  unpublish(id: number) {
    return apiClient.post<PinterestPin>(`${BASE}${id}/unpublish/`)
  },
  regenerateDescription(id: number) {
    return apiClient.post<PinterestPin>(`${BASE}${id}/regenerate-description/`)
  },
  updateDescription(id: number, description: string) {
    return apiClient.patch<PinterestPin>(`${BASE}${id}/`, { description })
  },
  uploadVideo(payload: PinterestVideoUploadPayload) {
    return apiClient.post<PinterestVideoUploadResponse>(`${BASE}upload-video/`, toUploadFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
