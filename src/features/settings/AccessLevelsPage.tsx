import { useState } from 'react'
import { Plus, Sparkles, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingState } from '@/components/LoadingState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAccessLevels, useDeleteAccessLevel, useSeedCrmPresets } from '@/hooks/use-access-levels'
import { AccessLevelFormDialog } from '@/features/settings/AccessLevelFormDialog'
import type { AccessLevel } from '@/types/access-level'

const CAPABILITY_FIELDS = [
  { key: 'can_view_reports', label: 'View reports' },
  { key: 'can_manage_users', label: 'Manage users' },
  { key: 'can_edit_properties', label: 'Edit properties' },
  { key: 'can_approve_listings', label: 'Approve listings' },
] as const

export function AccessLevelsPage() {
  const { data, isLoading, isError, refetch } = useAccessLevels()
  const deleteAccessLevel = useDeleteAccessLevel()
  const seedPresets = useSeedCrmPresets()
  const [editTarget, setEditTarget] = useState<AccessLevel | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<AccessLevel | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Access Levels</h1>
          <p className="text-sm text-muted-foreground">
            The entire capability model is these 4 booleans — assigned to staff users, superadmin-only.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={seedPresets.isPending}
            onClick={() => seedPresets.mutate()}
          >
            <Sparkles className="h-4 w-4" /> Seed CRM presets
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setEditTarget(null)}>
            <Plus className="h-4 w-4" /> New Access Level
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading access levels…" />
      ) : isError ? (
        <ErrorState description="Could not load access levels." onRetry={() => refetch()} />
      ) : !data?.results.length ? (
        <EmptyState
          title="No access levels yet"
          description="Create one, or seed the built-in CRM presets to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((level) => (
            <Card key={level.id} className="cursor-pointer" onClick={() => setEditTarget(level)}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{level.name}</p>
                    {level.description && <p className="text-xs text-muted-foreground">{level.description}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(level)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <ul className="space-y-1 text-sm">
                  {CAPABILITY_FIELDS.map((f) => (
                    <li key={f.key} className="flex items-center gap-2">
                      {level[f.key] ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className={level[f.key] ? '' : 'text-muted-foreground'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AccessLevelFormDialog
        open={editTarget !== undefined}
        onOpenChange={(open) => !open && setEditTarget(undefined)}
        accessLevel={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name || 'this access level'}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteAccessLevel.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteAccessLevel.isPending}
      />
    </div>
  )
}
