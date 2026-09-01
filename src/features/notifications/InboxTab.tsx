import { useState } from 'react'
import { Check, CheckCheck, Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import {
  useNotificationsList,
  useMarkRead,
  useMarkAllRead,
  useArchiveNotification,
  useDeleteNotification,
} from '@/hooks/use-notifications'

export function InboxTab() {
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const { data, isLoading, isError, refetch } = useNotificationsList(cursor)
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const archive = useArchiveNotification()
  const remove = useDeleteNotification()

  const extractCursor = (url: string | null) => {
    if (!url) return undefined
    return new URL(url).searchParams.get('cursor') ?? undefined
  }

  if (isLoading) return <LoadingState label="Loading notifications…" />
  if (isError) return <ErrorState description="Could not load notifications." onRetry={() => refetch()} />

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </div>

      {!data?.results.length ? (
        <EmptyState title="No notifications" />
      ) : (
        <div className="space-y-2">
          {data.results.map((n) => (
            <Card key={n.id} className={n.is_read ? 'opacity-70' : ''}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{n.title}</p>
                    {!n.is_read && <Badge variant="default">New</Badge>}
                    <Badge variant="outline">{n.category}</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!n.is_read && (
                    <Button variant="ghost" size="icon" onClick={() => markRead.mutate([n.id])} title="Mark read">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => archive.mutate(n.id)} title="Archive">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(n.id)} title="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2">
        {data?.previous && (
          <Button variant="outline" size="sm" onClick={() => setCursor(extractCursor(data.previous))}>
            Newer
          </Button>
        )}
        {data?.next && (
          <Button variant="outline" size="sm" onClick={() => setCursor(extractCursor(data.next))}>
            Older
          </Button>
        )}
      </div>
    </div>
  )
}
