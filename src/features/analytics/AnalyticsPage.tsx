import { useState } from 'react'
import { AlertTriangle, Building2, FolderKanban, Landmark, Users, Handshake } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { StatCard } from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { useDashboard } from '@/hooks/use-dashboard'
import { useViewsTimeSeries, useLeadsCount, useDealsCount } from '@/hooks/use-analytics'
import type { AnalyticsEntityType, AnalyticsPeriod } from '@/types/analytics'

export function AnalyticsPage() {
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard('month')
  const { data: leadsCount, isLoading: leadsLoading } = useLeadsCount()
  const { data: dealsCount, isLoading: dealsLoading } = useDealsCount()

  const [entity, setEntity] = useState<AnalyticsEntityType>('property')
  const [entityId, setEntityId] = useState('')
  const [period, setPeriod] = useState<AnalyticsPeriod>('day')

  const parsedId = entityId ? Number(entityId) : null
  const { data: series, isLoading: seriesLoading, isError: seriesError } = useViewsTimeSeries(entity, parsedId, period)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Composite of existing endpoints — see the note below.</p>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p>
          <strong>Limited data.</strong> No server-side revenue, lead-funnel, or traffic aggregation exists on
          the backend. This page combines the CRM dashboard counts, raw leads/deals totals, and a per-entity
          pageview lookup — it is not a general BI dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Properties" value={dashboard?.totals.properties ?? 0} icon={Building2} isLoading={dashboardLoading} />
        <StatCard label="Projects" value={dashboard?.totals.projects ?? 0} icon={FolderKanban} isLoading={dashboardLoading} />
        <StatCard label="Developers" value={dashboard?.totals.developers ?? 0} icon={Landmark} isLoading={dashboardLoading} />
        <StatCard label="Leads (total)" value={leadsCount ?? 0} icon={Users} isLoading={leadsLoading} />
        <StatCard label="Deals (total)" value={dealsCount ?? 0} icon={Handshake} isLoading={dealsLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pageviews by entity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label>Entity type</Label>
              <Select value={entity} onValueChange={(v) => setEntity(v as AnalyticsEntityType)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Entity ID</Label>
              <Input
                type="number"
                placeholder="e.g. 42"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Period</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!parsedId ? (
            <EmptyState title="Enter an entity ID" description="Pick a type and ID to see its pageview history." />
          ) : seriesError ? (
            <EmptyState title="Not found" description="No pageview data for that entity ID." />
          ) : seriesLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : series?.series.length ? (
            <>
              <p className="text-sm text-muted-foreground">
                {series.total} total views, {series.from} to {series.to}
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={series.series}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--gold))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <EmptyState title="No views recorded" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
