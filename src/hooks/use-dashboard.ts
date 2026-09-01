import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/services/dashboard'

export function useDashboard(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.get({ period }).then((r) => r.data),
    staleTime: 30_000,
  })
}
