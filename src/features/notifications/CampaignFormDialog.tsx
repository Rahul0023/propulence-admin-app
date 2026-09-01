import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { NotificationCampaign } from '@/types/notification'
import { useCreateCampaign, useUpdateCampaign } from '@/hooks/use-notifications'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
  image_url: z.string().optional(),
  action_url: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CampaignFormDialog({
  open,
  onOpenChange,
  campaign,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  campaign?: NotificationCampaign | null
}) {
  const isEdit = !!campaign
  const createMutation = useCreateCampaign()
  const updateMutation = useUpdateCampaign(campaign?.id ?? '')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', title: '', body: '', image_url: '', action_url: '' },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: campaign?.name ?? '',
        title: campaign?.title ?? '',
        body: campaign?.body ?? '',
        image_url: campaign?.image_url ?? '',
        action_url: campaign?.action_url ?? '',
      })
    }
  }, [open, campaign, reset])

  const onSubmit = (values: FormValues) => {
    const onSuccess = () => onOpenChange(false)
    if (isEdit && campaign) updateMutation.mutate(values, { onSuccess })
    else createMutation.mutate(values, { onSuccess })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Internal name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Notification title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" rows={3} {...register('body')} />
            {errors.body && <p className="text-sm text-destructive">{errors.body.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="action_url">Action URL</Label>
            <Input id="action_url" {...register('action_url')} />
          </div>
          <p className="text-xs text-muted-foreground">
            Audience targeting (roles/cities/budget filters) isn't exposed in this form yet — campaigns
            created here default to an empty audience_filters object; set targeting via the API directly
            until a picker is built.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create campaign'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
