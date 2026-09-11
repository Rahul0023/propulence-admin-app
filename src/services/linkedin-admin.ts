import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type { LinkedInAccount, LinkedInShare, LinkedInShareListParams } from '@/types/linkedin'

const BASE = '/api/linkedin'

export const linkedInOAuthApi = {
  start() {
    return apiClient.get<{ authorize_url: string }>(`${BASE}/oauth/start/`)
  },
}

export const linkedInAccountApi = {
  /** Singleton — always reads/writes the first (and only) account row. */
  get() {
    return apiClient.get<PaginatedResponse<LinkedInAccount>>(`${BASE}/accounts/`)
  },
  update(id: number, payload: Partial<Pick<LinkedInAccount, 'organization_urn' | 'publishing_enabled'>>) {
    return apiClient.patch<LinkedInAccount>(`${BASE}/accounts/${id}/`, payload)
  },
  disconnect() {
    return apiClient.post<LinkedInAccount>(`${BASE}/accounts/disconnect/`)
  },
}

export const linkedInSharesApi = {
  list(params: LinkedInShareListParams = {}) {
    return apiClient.get<PaginatedResponse<LinkedInShare>>(`${BASE}/shares/`, { params })
  },
  retry(id: number) {
    return apiClient.post<{ status: string; task_id: string }>(`${BASE}/shares/${id}/retry/`)
  },
}
