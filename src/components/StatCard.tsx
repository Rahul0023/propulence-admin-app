import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  isLoading?: boolean
  trend?: { value: string; positive?: boolean }
  className?: string
}

export function StatCard({ label, value, icon: Icon, isLoading, trend, className }: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="font-serif text-2xl font-semibold">{value}</p>
          )}
          {trend && (
            <p className={cn('text-xs font-medium', trend.positive ? 'text-success' : 'text-destructive')}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}
