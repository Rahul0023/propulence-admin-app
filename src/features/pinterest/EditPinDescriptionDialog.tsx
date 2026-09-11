import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUpdatePinterestDescription } from '@/hooks/use-pinterest'
import type { PinterestPin } from '@/types/pinterest'

const schema = z.object({
  description: z.string().max(800, 'Description must be 800 characters or fewer'),
})

type FormValues = z.infer<typeof schema>

interface EditPinDescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pin: PinterestPin | null
}

export function EditPinDescriptionDialog({ open, onOpenChange, pin }: EditPinDescriptionDialogProps) {
  const updateDescription = useUpdatePinterestDescription()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: '' },
  })

  useEffect(() => {
    if (open) reset({ description: pin?.description ?? '' })
  }, [open, pin, reset])

  const onSubmit = (values: FormValues) => {
    if (!pin) return
    updateDescription.mutate(
      { id: pin.id, description: values.description },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit description</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin-description">Description</Label>
            <Textarea id="pin-description" rows={5} {...register('description')} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateDescription.isPending}>
              {updateDescription.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
