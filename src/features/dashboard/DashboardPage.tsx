import { Building2, FolderKanban, Landmark } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { StatCard } from '@/components/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { useDashboard } from '@/hooks/use-dashboard'
import type { DashboardBucket } from '@/types/dashboard'

/** Merges the three per-entity bucket arrays into one row-per-date array for a combined chart. */
function mergeTimeseries(developers: DashboardBucket[], projects: DashboardBucket[], properties: DashboardBucket[]) {
  const byDate = new Map<string, { date: string; developers: number; projects: number; properties: number }>()
  const upsert = (key: 'developers' | 'projects' | 'properties', rows: DashboardBucket[]) => {
    for (const row of rows) {
      const entry = byDate.get(row.bucket) ?? { date: row.bucket, developers: 0, projects: 0, properties: 0 }
      entry[key] = row.count
      byDate.set(row.bucket, entry)
    }
  }
  upsert('developers', developers)
  upsert('projects', projects)
  upsert('properties', properties)
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard('month')

  if (isError) return <ErrorState description="Could not load dashboard data." onRetry={() => refetch()} />

  const chartData = data
    ? mergeTimeseries(data.timeseries.developers, data.timeseries.projects, data.timeseries.properties)
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live counts from properties, projects, and developers. No leads, revenue, or funnel data —
          not available from the backend today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Properties" value={data?.totals.properties ?? 0} icon={Building2} isLoading={isLoading} />
        <StatCard label="Projects" value={data?.totals.projects ?? 0} icon={FolderKanban} isLoading={isLoading} />
        <StatCard label="Developers" value={data?.totals.developers ?? 0} icon={Landmark} isLoading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity over time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="properties" name="Properties" stroke="hsl(var(--gold))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="projects" name="Projects" stroke="hsl(var(--navy))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="developers" name="Developers" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No activity data yet" />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentList
          title="Recent Properties"
          isLoading={isLoading}
          items={data?.recent.properties.map((p) => ({ id: p.id, name: p.title || 'Untitled', created_at: p.created_at }))}
        />
        <RecentList
          title="Recent Projects"
          isLoading={isLoading}
          items={data?.recent.projects.map((p) => ({ id: p.id, name: p.name, created_at: p.created_at }))}
        />
        <RecentList
          title="Recent Developers"
          isLoading={isLoading}
          items={data?.recent.developers.map((d) => ({ id: d.id, name: d.name, created_at: d.created_at }))}
        />
      </div>
    </div>
  )
}

function RecentList({
  title,
  items,
  isLoading,
}: {
  title: string
  items?: { id: number | string; name: string; created_at: string }[]
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items?.length ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nothing recent" className="p-6" />
        )}
      </CardContent>
    </Card>
  )
}
