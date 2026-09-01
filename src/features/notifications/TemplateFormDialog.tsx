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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES } from '@/types/notification'
import type { NotificationTemplate } from '@/types/notification'
import { useCreateTemplate, useUpdateTemplate } from '@/hooks/use-notifications'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  notification_type: z.string().min(1, 'Required'),
  category: z.enum(NOTIFICATION_CATEGORIES),
  title_template: z.string().min(1, 'Required'),
  body_template: z.string().min(1, 'Required'),
  image_url: z.string().optional(),
  action_url: z.string().optional(),
  deep_link_template: z.string().optional(),
  priority: z.enum(NOTIFICATION_PRIORITIES),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function TemplateFormDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  template?: NotificationTemplate | null
}) {
  const isEdit = !!template
  const createMutation = useCreateTemplate()
  const updateMutation = useUpdateTemplate(template?.id ?? 0)

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      notification_type: '',
      category: 'GENERAL',
      title_template: '',
      body_template: '',
      image_url: '',
      action_url: '',
      deep_link_template: '',
      priority: 'NORMAL',
      is_active: true,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: template?.name ?? '',
        notification_type: template?.notification_type ?? '',
        category: template?.category ?? 'GENERAL',
        title_template: template?.title_template ?? '',
        body_template: template?.body_template ?? '',
        image_url: template?.image_url ?? '',
        action_url: template?.action_url ?? '',
        deep_link_template: template?.deep_link_template ?? '',
        priority: template?.priority ?? 'NORMAL',
        is_active: template?.is_active ?? true,
      })
    }
  }, [open, template, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      image_url: values.image_url || null,
      action_url: values.action_url || null,
      deep_link_template: values.deep_link_template || null,
    }
    const onSuccess = () => onOpenChange(false)
    if (isEdit && template) updateMutation.mutate(payload, { onSuccess })
    else createMutation.mutate(payload, { onSuccess })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Template' : 'New Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification_type">Notification type key</Label>
              <Input id="notification_type" {...register('notification_type')} placeholder="e.g. NEW_LEAD" />
              {errors.notification_type && <p className="text-sm text-destructive">{errors.notification_type.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_template">Title template</Label>
            <Input id="title_template" {...register('title_template')} placeholder="e.g. New lead from {name}" />
            {errors.title_template && <p className="text-sm text-destructive">{errors.title_template.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_template">Body template</Label>
            <Textarea id="body_template" rows={3} {...register('body_template')} />
            {errors.body_template && <p className="text-sm text-destructive">{errors.body_template.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action_url">Action URL</Label>
              <Input id="action_url" {...register('action_url')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deep_link_template">Deep link template</Label>
              <Input id="deep_link_template" {...register('deep_link_template')} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active" className="font-normal">Active</Label>
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create template'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
