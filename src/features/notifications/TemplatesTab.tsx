import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { StatusBadge } from '@/components/StatusBadge'
import { useNotificationTemplates, useDeleteTemplate } from '@/hooks/use-notifications'
import { TemplateFormDialog } from '@/features/notifications/TemplateFormDialog'
import type { NotificationTemplate } from '@/types/notification'

export function TemplatesTab() {
  const { data, isLoading, isError, refetch } = useNotificationTemplates()
  const deleteTemplate = useDeleteTemplate()
  const [editTarget, setEditTarget] = useState<NotificationTemplate | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<NotificationTemplate | null>(null)

  if (isLoading) return <LoadingState label="Loading templates…" />
  if (isError) return <ErrorState description="Could not load templates." onRetry={() => refetch()} />

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={() => setEditTarget(null)}>
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      {!data?.results.length ? (
        <EmptyState title="No templates yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.results.map((t) => (
            <Card key={t.id} className="cursor-pointer" onClick={() => setEditTarget(t)}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.notification_type}</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(t) }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{t.title_template}</p>
                <div className="flex gap-1">
                  <Badge variant="outline">{t.category}</Badge>
                  <StatusBadge active={t.is_active} onLabel="Active" offLabel="Inactive" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateFormDialog open={editTarget !== undefined} onOpenChange={(o) => !o && setEditTarget(undefined)} template={editTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteTemplate.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteTemplate.isPending}
      />
    </div>
  )
}
