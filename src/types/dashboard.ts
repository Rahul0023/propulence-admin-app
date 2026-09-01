/**
 * Real shape of GET /api/crm/dashboard/ — verified against CRMDashboardView
 * (apps/crm/views/views.py:414-527) and its DeveloperDashboardMiniSerializer /
 * ProjectDashboardMiniSerializer / PropertyDashboardMiniSerializer
 * (apps/crm/serializers/dashboard_serializers.py). No leads/revenue/funnel — counts and
 * time series cover developers/projects/properties only.
 */
export interface DashboardTotals {
  developers: number
  projects: number
  properties: number
}

export interface DashboardBucket {
  bucket: string
  count: number
}

export interface DashboardTimeseries {
  developers: DashboardBucket[]
  projects: DashboardBucket[]
  properties: DashboardBucket[]
}

export interface RecentDeveloper {
  id: number
  name: string
  website: string | null
  slug: string
  created_at: string
}

export interface RecentProject {
  id: number
  name: string
  status: string
  project_type: string
  created_at: string
}

export interface RecentProperty {
  id: number
  title: string | null
  listing_type: string
  property_type: string
  status: string
  price: string | null
  created_at: string
}

export interface DashboardResponse {
  range: { start: string; end: string; period: string }
  totals: DashboardTotals
  timeseries: DashboardTimeseries
  recent: {
    developers: RecentDeveloper[]
    projects: RecentProject[]
    properties: RecentProperty[]
  }
}
