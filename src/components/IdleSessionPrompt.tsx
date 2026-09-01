import { useIdleTimeout } from '@/hooks/use-idle-timeout'
import { Button } from '@/components/ui/button'

export function IdleSessionPrompt() {
  const { isIdle, dismiss } = useIdleTimeout(30)

  if (!isIdle) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-lg border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg">
        <span>You've been idle a while. Still there?</span>
        <Button size="sm" variant="accent" onClick={dismiss}>
          I'm here
        </Button>
      </div>
    </div>
  )
}
