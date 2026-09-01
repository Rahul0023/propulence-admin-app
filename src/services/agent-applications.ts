import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type {
  AgentApplication,
  AgentApplicationDecisionResponse,
  AgentApplicationListParams,
} from '@/types/agent-applications'

const BASE = '/api/agent/applications/'

export const agentApplicationsApi = {
  list(params: AgentApplicationListParams = {}) {
    return apiClient.get<PaginatedResponse<AgentApplication>>(BASE, { params })
  },
  decide(id: number, decision: 'approve' | 'reject', adminNote: string) {
    return apiClient.post<AgentApplicationDecisionResponse>(`${BASE}${id}/${decision}/`, {
      admin_note: adminNote,
    })
  },
}
