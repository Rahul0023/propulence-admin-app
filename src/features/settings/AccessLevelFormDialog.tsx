import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { AccessLevel } from '@/types/access-level'
import { useCreateAccessLevel, useUpdateAccessLevel } from '@/hooks/use-access-levels'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  can_view_reports: z.boolean(),
  can_manage_users: z.boolean(),
  can_edit_properties: z.boolean(),
  can_approve_listings: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const CAPABILITY_FIELDS = [
  { key: 'can_view_reports', label: 'View reports' },
  { key: 'can_manage_users', label: 'Manage users' },
  { key: 'can_edit_properties', label: 'Edit properties' },
  { key: 'can_approve_listings', label: 'Approve listings' },
] as const

interface AccessLevelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accessLevel?: AccessLevel | null
}

export function AccessLevelFormDialog({ open, onOpenChange, accessLevel }: AccessLevelFormDialogProps) {
  const isEdit = !!accessLevel
  const createMutation = useCreateAccessLevel()
  const updateMutation = useUpdateAccessLevel(accessLevel?.id ?? 0)

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      can_view_reports: false,
      can_manage_users: false,
      can_edit_properties: false,
      can_approve_listings: false,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: accessLevel?.name ?? '',
        description: accessLevel?.description ?? '',
        can_view_reports: accessLevel?.can_view_reports ?? false,
        can_manage_users: accessLevel?.can_manage_users ?? false,
        can_edit_properties: accessLevel?.can_edit_properties ?? false,
        can_approve_listings: accessLevel?.can_approve_listings ?? false,
      })
    }
  }, [open, accessLevel, reset])

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, description: values.description ?? '' }
    const onSuccess = () => onOpenChange(false)
    if (isEdit && accessLevel) {
      updateMutation.mutate(payload, { onSuccess })
    } else {
      createMutation.mutate(payload, { onSuccess })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Access Level' : 'New Access Level'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register('description')} />
          </div>

          <div className="space-y-3 rounded-md border p-3">
            {CAPABILITY_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <Label htmlFor={field.key} className="font-normal">
                  {field.label}
                </Label>
                <Controller
                  control={control}
                  name={field.key}
                  render={({ field: f }) => <Switch id={field.key} checked={f.value} onCheckedChange={f.onChange} />}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create access level'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
