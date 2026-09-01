import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/LoadingState'
import { useNotificationPreferences, useUpdatePreferences } from '@/hooks/use-notifications'
import type { NotificationPreference } from '@/types/notification'

const TOGGLES: { key: keyof NotificationPreference; label: string }[] = [
  { key: 'enable_push', label: 'Push notifications' },
  { key: 'enable_transactional', label: 'Transactional' },
  { key: 'enable_marketing', label: 'Marketing' },
  { key: 'enable_news', label: 'News' },
  { key: 'enable_price_alerts', label: 'Price alerts' },
  { key: 'enable_site_visit_alerts', label: 'Site visit alerts' },
  { key: 'enable_project_updates', label: 'Project updates' },
  { key: 'enable_lead_alerts', label: 'Lead alerts' },
]

export function PreferencesTab() {
  const { data, isLoading } = useNotificationPreferences()
  const update = useUpdatePreferences()
  const [local, setLocal] = useState<NotificationPreference | null>(null)

  useEffect(() => {
    if (data) setLocal(data)
  }, [data])

  if (isLoading || !local) return <LoadingState label="Loading preferences…" />

  return (
    <Card className="max-w-lg">
      <CardContent className="space-y-4 p-5">
        {TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between">
            <Label className="font-normal">{t.label}</Label>
            <Switch
              checked={Boolean(local[t.key])}
              onCheckedChange={(v) => setLocal((prev) => (prev ? { ...prev, [t.key]: v } : prev))}
            />
          </div>
        ))}
        <Button onClick={() => update.mutate(local)} disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
