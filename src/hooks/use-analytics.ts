import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/services/analytics'
import type { AnalyticsEntityType, AnalyticsPeriod } from '@/types/analytics'

export function useViewsTimeSeries(entity: AnalyticsEntityType, id: number | null, period: AnalyticsPeriod) {
  return useQuery({
    queryKey: ['analytics', 'views', entity, id, period],
    queryFn: () => analyticsApi.viewsTimeSeries(entity, id!, period).then((r) => r.data),
    enabled: id !== null && id > 0,
  })
}

export function useLeadsCount() {
  return useQuery({
    queryKey: ['analytics', 'leads-count'],
    queryFn: () => analyticsApi.leadsCount(),
    retry: false,
  })
}

export function useDealsCount() {
  return useQuery({
    queryKey: ['analytics', 'deals-count'],
    queryFn: () => analyticsApi.dealsCount(),
    retry: false,
  })
}
