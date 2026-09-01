import { useState } from 'react'
import { Plus, Trash2, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useNotificationCampaigns, useDeleteCampaign, useLaunchCampaign } from '@/hooks/use-notifications'
import { CampaignFormDialog } from '@/features/notifications/CampaignFormDialog'
import type { NotificationCampaign } from '@/types/notification'

export function CampaignsTab() {
  const { data, isLoading, isError, refetch } = useNotificationCampaigns()
  const deleteCampaign = useDeleteCampaign()
  const launchCampaign = useLaunchCampaign()
  const [editTarget, setEditTarget] = useState<NotificationCampaign | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<NotificationCampaign | null>(null)

  if (isLoading) return <LoadingState label="Loading campaigns…" />
  if (isError) return <ErrorState description="Could not load campaigns." onRetry={() => refetch()} />

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={() => setEditTarget(null)}>
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      {!data?.results.length ? (
        <EmptyState title="No campaigns yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.results.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer" onClick={() => setEditTarget(c)}>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.title}</p>
                  </div>
                  <div className="flex gap-1">
                    {c.status === 'DRAFT' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Launch"
                        title="Launch"
                        disabled={launchCampaign.isPending}
                        onClick={() => launchCampaign.mutate(c.id)}
                      >
                        <Rocket className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">{c.status}</Badge>
                  <span className="text-muted-foreground">
                    {c.sent_count}/{c.total_recipients} sent · {c.delivered_count} delivered · {c.clicked_count} clicked
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CampaignFormDialog open={editTarget !== undefined} onOpenChange={(o) => !o && setEditTarget(undefined)} campaign={editTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteCampaign.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteCampaign.isPending}
      />
    </div>
  )
}
