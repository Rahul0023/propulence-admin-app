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
import { useAiRules, useDeleteAiRule } from '@/hooks/use-notifications'
import { AiRuleFormDialog } from '@/features/notifications/AiRuleFormDialog'
import type { AINotificationRule } from '@/types/notification'

export function AiRulesTab() {
  const { data, isLoading, isError, refetch } = useAiRules()
  const deleteRule = useDeleteAiRule()
  const [editTarget, setEditTarget] = useState<AINotificationRule | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<AINotificationRule | null>(null)

  if (isLoading) return <LoadingState label="Loading AI rules…" />
  if (isError) return <ErrorState description="Could not load AI rules." onRetry={() => refetch()} />

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={() => setEditTarget(null)}>
          <Plus className="h-4 w-4" /> New Rule
        </Button>
      </div>

      {!data?.results.length ? (
        <EmptyState title="No AI rules yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.results.map((r) => (
            <Card key={r.id} className="cursor-pointer" onClick={() => setEditTarget(r)}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.rule_type.replace(/_/g, ' ')}</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge active={r.is_active} onLabel="Active" offLabel="Inactive" />
                  <Badge variant="secondary">Cooldown {r.cooldown_hours}h</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AiRuleFormDialog open={editTarget !== undefined} onOpenChange={(o) => !o && setEditTarget(undefined)} rule={editTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteRule.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteRule.isPending}
      />
    </div>
  )
}
