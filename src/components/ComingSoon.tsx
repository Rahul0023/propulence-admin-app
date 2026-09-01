import { Construction } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

/** Placeholder for modules not yet built in a given phase — see the phased implementation plan. */
export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">{title}</h1>
      <EmptyState
        icon={Construction}
        title="Coming in a later phase"
        description={note ?? `${title} is scoped in the implementation plan but not yet built.`}
      />
    </div>
  )
}
