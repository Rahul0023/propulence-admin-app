import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type { AnalyticsEntityType, AnalyticsPeriod, ViewsTimeSeriesResponse } from '@/types/analytics'

export const analyticsApi = {
  viewsTimeSeries(entity: AnalyticsEntityType, id: number, period: AnalyticsPeriod) {
    return apiClient.get<ViewsTimeSeriesResponse>('/api/analytics/views/', { params: { entity, id, period } })
  },
  // Cheap way to get a total count without a dedicated aggregation endpoint (none exists) —
  // page_size=1 and read `.count` from the standard paginated response.
  leadsCount() {
    return apiClient
      .get<PaginatedResponse<unknown>>('/api/leads/crm/leads/', { params: { page_size: 1 } })
      .then((r) => r.data.count)
  },
  // DealListAPIView returns a plain array (no pagination wrapper) — confirmed via source,
  // apps/crm/views/deal_views.py:83-89 — so the count is just the array length.
  dealsCount() {
    return apiClient.get<unknown[]>('/api/crm/deals/list').then((r) => r.data.length)
  },
}
