/**
 * Real shape of GET /api/analytics/views/ per views_timeseries()'s documented return
 * (apps/analytics/queries.py:12-28) — requires entity + id, so this is per-entity pageviews only,
 * not a site-wide traffic aggregate. entity/id are required query params on the backend.
 */
export type AnalyticsEntityType = 'property' | 'project' | 'developer'
export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year'

export interface ViewsTimeSeriesPoint {
  date: string
  label: string
  count: number
}

export interface ViewsTimeSeriesResponse {
  entity: AnalyticsEntityType
  entity_id: number
  period: AnalyticsPeriod
  from: string
  to: string
  series: ViewsTimeSeriesPoint[]
  total: number
}
