import { Badge } from '@/components/ui/badge'

/** Maps the boolean toggle fields real endpoints expose (verified/published/featured/active) to a colored badge. */
export function StatusBadge({ active, onLabel, offLabel }: { active: boolean; onLabel: string; offLabel: string }) {
  return (
    <Badge variant={active ? 'success' : 'secondary'} className="whitespace-nowrap">
      {active ? onLabel : offLabel}
    </Badge>
  )
}
