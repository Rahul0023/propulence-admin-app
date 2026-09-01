import { Send, CheckCheck, Eye, MousePointerClick } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { useNotificationAnalytics } from '@/hooks/use-notifications'

export function NotificationAnalyticsTab() {
  const { data, isLoading, isError, refetch } = useNotificationAnalytics()

  if (isLoading) return <LoadingState label="Loading analytics…" />
  if (isError) return <ErrorState description="Could not load notification analytics." onRetry={() => refetch()} />
  if (!data) return null

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Last {data.period_days} days, system-wide.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total sent" value={data.total} icon={Send} />
        <StatCard label="Delivered" value={`${data.delivered} (${data.delivery_rate}%)`} icon={CheckCheck} />
        <StatCard label="Read" value={`${data.read} (${data.open_rate}%)`} icon={Eye} />
        <StatCard label="Clicked" value={`${data.clicked} (${data.click_through_rate}%)`} icon={MousePointerClick} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By category</CardTitle>
        </CardHeader>
        <CardContent>
          {data.by_category.length ? (
            <ul className="space-y-2">
              {data.by_category.map((c) => (
                <li key={c.category} className="flex items-center justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="text-muted-foreground">{c.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No data yet" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
