import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BlogAuthor } from '@/types/blog'
import { useCreateBlogAuthor, useUpdateBlogAuthor } from '@/hooks/use-blog-admin'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  designation: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AuthorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  author?: BlogAuthor | null
}

export function AuthorFormDialog({ open, onOpenChange, author }: AuthorFormDialogProps) {
  const isEdit = !!author
  const [image, setImage] = useState<File | null>(null)
  const createMutation = useCreateBlogAuthor()
  const updateMutation = useUpdateBlogAuthor(author?.id ?? 0)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: '', last_name: '', designation: '', company: '', email: '', bio: '', website: '' },
  })

  useEffect(() => {
    if (open) {
      setImage(null)
      reset({
        first_name: author?.first_name ?? '',
        last_name: author?.last_name ?? '',
        designation: author?.designation ?? '',
        company: author?.company ?? '',
        email: author?.email ?? '',
        bio: author?.bio ?? '',
        website: author?.website ?? '',
      })
    }
  }, [open, author, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      designation: values.designation ?? '',
      company: values.company ?? '',
      email: values.email ?? '',
      bio: values.bio ?? '',
      website: values.website ?? '',
    }
    const onSuccess = () => onOpenChange(false)
    if (isEdit && author) updateMutation.mutate({ payload, image }, { onSuccess })
    else createMutation.mutate({ payload, image }, { onSuccess })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Author' : 'New Author'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...register('first_name')} />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...register('last_name')} />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation (optional)</Label>
              <Input id="designation" {...register('designation')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input id="company" {...register('company')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input id="website" placeholder="https://…" {...register('website')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea id="bio" rows={3} {...register('bio')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_image">Profile image (optional)</Label>
            <Input id="profile_image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
            {author?.profile_image && !image && (
              <p className="text-xs text-muted-foreground">Leave blank to keep the current image.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create author'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
