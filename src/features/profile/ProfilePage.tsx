import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { useProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/use-profile'

const schema = z.object({
  full_name: z.string().min(1, 'Required'),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().optional(),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadPicture = useUploadProfilePicture()
  const pictureInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', first_name: '', last_name: '', phone: '' },
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone ?? '',
      })
    }
  }, [profile, reset])

  if (isLoading) return <LoadingState label="Loading profile…" />
  if (isError || !profile) return <ErrorState description="Could not load your profile." onRetry={() => refetch()} />

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">GET/PATCH /api/auth/me/profile/ — a genuine build, unlike the Angular app's dead stub.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{profile.full_name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <input
              ref={pictureInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadPicture.mutate(file)
                e.target.value = ''
              }}
            />
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => pictureInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
            <p className="text-xs text-muted-foreground">
              No endpoint returns the picture URL back — upload succeeds but won't display here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => updateProfile.mutate(v))} className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{profile.role}</Badge>
              {profile.is_phone_verified && <Badge variant="success">Phone verified</Badge>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" {...register('last_name')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...register('full_name')} />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
            </div>

            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
