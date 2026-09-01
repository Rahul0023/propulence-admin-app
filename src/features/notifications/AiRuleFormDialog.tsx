import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AI_RULE_TYPES } from '@/types/notification'
import type { AINotificationRule } from '@/types/notification'
import { useCreateAiRule, useUpdateAiRule } from '@/hooks/use-notifications'
import { useNotificationTemplates } from '@/hooks/use-notifications'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  rule_type: z.enum(AI_RULE_TYPES),
  template: z.string().min(1, 'Select a template'),
  is_active: z.boolean(),
  cooldown_hours: z.string(),
})

type FormValues = z.infer<typeof schema>

export function AiRuleFormDialog({
  open,
  onOpenChange,
  rule,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  rule?: AINotificationRule | null
}) {
  const isEdit = !!rule
  const { data: templatesData } = useNotificationTemplates()
  const createMutation = useCreateAiRule()
  const updateMutation = useUpdateAiRule(rule?.id ?? 0)

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', rule_type: 'INACTIVITY', template: '', is_active: true, cooldown_hours: '24' },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: rule?.name ?? '',
        rule_type: rule?.rule_type ?? 'INACTIVITY',
        template: rule?.template ? String(rule.template) : '',
        is_active: rule?.is_active ?? true,
        cooldown_hours: rule?.cooldown_hours?.toString() ?? '24',
      })
    }
  }, [open, rule, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      rule_type: values.rule_type,
      template: Number(values.template),
      is_active: values.is_active,
      cooldown_hours: Number(values.cooldown_hours),
      conditions: rule?.conditions ?? {},
    }
    const onSuccess = () => onOpenChange(false)
    if (isEdit && rule) updateMutation.mutate(payload, { onSuccess })
    else createMutation.mutate(payload, { onSuccess })
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit AI Rule' : 'New AI Rule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Rule type</Label>
            <Controller
              control={control}
              name="rule_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AI_RULE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <Controller
              control={control}
              name="template"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                  <SelectContent>
                    {templatesData?.results.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.template && <p className="text-sm text-destructive">{errors.template.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooldown_hours">Cooldown (hours)</Label>
            <Input id="cooldown_hours" type="number" {...register('cooldown_hours')} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active" className="font-normal">Active</Label>
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Trigger conditions (threshold/days/percentage JSON) aren't exposed in this form yet — new
            rules default to an empty conditions object; edit conditions via the API directly for now.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create rule'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
