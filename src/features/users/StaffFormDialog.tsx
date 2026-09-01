import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { UserRole } from '@/types/auth'
import type { StaffUser } from '@/types/staff'
import { useAccessLevels } from '@/hooks/use-access-levels'
import { useCreateStaff, useUpdateStaff } from '@/hooks/use-staff'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
  password: z.string().optional(),
  access_level_ids: z.array(z.number()).default([]),
})

type FormValues = z.infer<typeof schema>

interface StaffFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: StaffUser | null
}

export function StaffFormDialog({ open, onOpenChange, staff }: StaffFormDialogProps) {
  const isEdit = !!staff
  const { data: accessLevelsData } = useAccessLevels()
  const createMutation = useCreateStaff()
  const updateMutation = useUpdateStaff(staff?.id ?? 0)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
      role: UserRole.STAFF,
      password: '',
      access_level_ids: [],
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        email: staff?.email ?? '',
        full_name: staff?.full_name ?? '',
        phone: staff?.phone ?? '',
        role: staff?.role ?? UserRole.STAFF,
        password: '',
        access_level_ids: staff?.access_levels.map((a) => a.id) ?? [],
      })
    }
  }, [open, staff, reset])

  const onSubmit = (values: FormValues) => {
    const payload = {
      email: values.email,
      full_name: values.full_name,
      phone: values.phone || undefined,
      role: values.role,
      access_level_ids: values.access_level_ids,
      ...(values.password ? { password: values.password } : {}),
    }
    const onSuccess = () => onOpenChange(false)
    if (isEdit && staff) {
      updateMutation.mutate(payload, { onSuccess })
    } else {
      createMutation.mutate(payload, { onSuccess })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Staff User' : 'New Staff User'}</DialogTitle>
          {!isEdit && (
            <DialogDescription>
              Leave password blank to auto-generate one as {'{firstname}@123'} (backend default).
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <Input id="password" type="password" {...register('password')} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Access levels</Label>
            <Controller
              control={control}
              name="access_level_ids"
              render={({ field }) => (
                <div className="space-y-2 rounded-md border p-3">
                  {accessLevelsData?.results.length ? (
                    accessLevelsData.results.map((level) => {
                      const checked = field.value.includes(level.id)
                      return (
                        <label key={level.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) =>
                              field.onChange(
                                v ? [...field.value, level.id] : field.value.filter((id) => id !== level.id),
                              )
                            }
                          />
                          {level.name}
                        </label>
                      )
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground">No access levels yet — create one under Access Levels.</p>
                  )}
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
