import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AgentApplication } from '@/types/agent-applications'

interface RejectApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: AgentApplication | null
  isLoading?: boolean
  onConfirm: (adminNote: string) => void
}

export function RejectApplicationDialog({
  open,
  onOpenChange,
  application,
  isLoading,
  onConfirm,
}: RejectApplicationDialogProps) {
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    if (open) setAdminNote('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject "{application?.full_name || 'this application'}"?</DialogTitle>
          <DialogDescription>Let the applicant know why — this note is stored on the application.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="admin_note">Reason (optional)</Label>
          <Textarea
            id="admin_note"
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="e.g. License number could not be verified"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(adminNote)} disabled={isLoading}>
            {isLoading ? 'Rejecting…' : 'Reject application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
