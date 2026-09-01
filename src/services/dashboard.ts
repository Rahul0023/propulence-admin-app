import { apiClient } from '@/lib/api-client'
import type { DashboardResponse } from '@/types/dashboard'

export const dashboardApi = {
  // GET /api/crm/dashboard/ — properties/projects/developers only, no leads/revenue/funnel.
  get(params: { period?: 'day' | 'week' | 'month' | 'year' } = {}) {
    return apiClient.get<DashboardResponse>('/api/crm/dashboard/', { params })
  },
}
