import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type { Project, ProjectFormValues, ProjectListParams } from '@/types/project'

const BASE = '/api/crm/projects/'

export const projectsApi = {
  list(params: ProjectListParams = {}) {
    return apiClient.get<PaginatedResponse<Project>>(BASE, { params })
  },
  get(id: number) {
    return apiClient.get<Project>(`${BASE}${id}/`)
  },
  create(payload: Partial<ProjectFormValues>) {
    return apiClient.post<Project>(BASE, payload)
  },
  update(id: number, payload: Partial<ProjectFormValues>) {
    return apiClient.patch<Project>(`${BASE}${id}/`, payload)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}${id}/`)
  },
  // toggle-verify is dead/commented-out code on the backend — do not call it.
  togglePublish(id: number) {
    return apiClient.post<Project>(`${BASE}${id}/toggle-publish/`)
  },
  toggleFeatured(id: number) {
    return apiClient.post<Project>(`${BASE}${id}/toggle-featured/`)
  },
  IMPORT_PATH: '/api/crm/projects-import/',
  EXPORT_PATH: '/api/crm/projects-export/',
  TEMPLATE_CSV_PATH: '/api/crm/projects-template-csv/',
  TEMPLATE_XLSX_PATH: '/api/crm/projects-template-xlsx/',
  RERA_PATH: '/api/crm/projects-rera/',
  importFile(file: File) {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post(projectsApi.IMPORT_PATH, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
