import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, QrCode, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/LoadingState'
import { useBusinessProfile, useCreateBusinessProfile, useUpdateBusinessProfile, useRegenerateQr } from '@/hooks/use-business-profiles'
import { businessProfilesApi } from '@/services/business-profiles'
import { downloadAuthenticated } from '@/lib/download'

const schema = z.object({
  full_name: z.string().min(1, 'Required'),
  designation: z.string().optional(),
  company_name: z.string().optional(),
  department: z.string().optional(),
  industry: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  alternate_phone: z.string().optional(),
  website: z.string().optional(),
  linkedin_url: z.string().optional(),
  address_line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function BusinessProfileFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const profileId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const { data: profile, isLoading } = useBusinessProfile(profileId)
  const createMutation = useCreateBusinessProfile()
  const updateMutation = useUpdateBusinessProfile(profileId ?? 0)
  const regenerateQr = useRegenerateQr(profileId ?? 0)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '', designation: '', company_name: '', department: '', industry: '',
      email: '', phone: '', alternate_phone: '', website: '', linkedin_url: '',
      address_line1: '', city: '', state: '', country: '', pincode: '', notes: '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        designation: profile.designation,
        company_name: profile.company_name,
        department: profile.department,
        industry: profile.industry,
        email: profile.email,
        phone: profile.phone,
        alternate_phone: profile.alternate_phone,
        website: profile.website,
        linkedin_url: profile.linkedin_url,
        address_line1: profile.address_line1,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        pincode: profile.pincode,
        notes: profile.notes,
      })
    }
  }, [profile, reset])

  if (isEdit && isLoading) return <LoadingState label="Loading business profile…" />

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, tags: profile?.tags ?? [] }
    const onSuccess = () => navigate('/business-profiles')
    if (isEdit && profileId) {
      updateMutation.mutate({ values: payload, photo: photoFile }, { onSuccess })
    } else {
      createMutation.mutate({ values: payload, photo: photoFile }, { onSuccess })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/business-profiles')}>
        <ArrowLeft className="h-4 w-4" /> Back to Business Profiles
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">{isEdit ? 'Edit Business Profile' : 'New Business Profile'}</h1>
        {isEdit && profile && <Badge variant="outline">{profile.source}</Badge>}
      </div>

      {isEdit && profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4" /> QR &amp; vCard
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {profile.qr_png_url ? (
              <img src={profile.qr_png_url} alt="QR code" className="h-24 w-24 rounded border bg-white p-1" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded border text-xs text-muted-foreground">
                No QR yet
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => downloadAuthenticated(businessProfilesApi.vcardPath(profile.id), `${profile.full_name || 'contact'}.vcf`)}
              >
                <Download className="h-3.5 w-3.5" /> Download vCard
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={regenerateQr.isPending}
                onClick={() => regenerateQr.mutate()}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate QR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={photoFile ? URL.createObjectURL(photoFile) : (profile?.photo_url ?? undefined)} />
            <AvatarFallback>{(profile?.full_name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => photoInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> {photoFile ? photoFile.name : 'Choose photo'}
          </Button>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal &amp; Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" {...register('full_name')} />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" {...register('designation')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company</Label>
                <Input id="company_name" {...register('company_name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...register('department')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...register('industry')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="alternate_phone">Alternate phone</Label>
              <Input id="alternate_phone" {...register('alternate_phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register('website')} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input id="linkedin_url" {...register('linkedin_url')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line1">Address</Label>
              <Input id="address_line1" {...register('address_line1')} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register('state')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" {...register('pincode')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea rows={3} {...register('notes')} />
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Tags aren't exposed in this form yet — existing tags are preserved on save, but there's no
          picker to add/remove them here.
        </p>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/business-profiles')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
