import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BlogTag } from '@/types/blog'
import { useCreateBlogTag, useUpdateBlogTag } from '@/hooks/use-blog-admin'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormValues = z.infer<typeof schema>

interface TagFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag?: BlogTag | null
}

export function TagFormDialog({ open, onOpenChange, tag }: TagFormDialogProps) {
  const isEdit = !!tag
  const createMutation = useCreateBlogTag()
  const updateMutation = useUpdateBlogTag(tag?.id ?? 0)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (open) reset({ name: tag?.name ?? '' })
  }, [open, tag, reset])

  const onSubmit = (values: FormValues) => {
    const onSuccess = () => onOpenChange(false)
    if (isEdit && tag) updateMutation.mutate(values, { onSuccess })
    else createMutation.mutate(values, { onSuccess })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tag' : 'New Tag'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create tag'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
