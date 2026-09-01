import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingState } from '@/components/LoadingState'
import { StatusBadge } from '@/components/StatusBadge'
import {
  useDeveloper,
  useCreateDeveloper,
  useUpdateDeveloper,
  useTogglePublishDeveloper,
  useUploadDeveloperImages,
} from '@/hooks/use-developers'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  company_name: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  country: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function DeveloperFormPage() {
  const { slug } = useParams()
  const isEdit = !!slug
  const navigate = useNavigate()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const { data: developer, isLoading } = useDeveloper(slug)
  const createMutation = useCreateDeveloper()
  const updateMutation = useUpdateDeveloper(slug ?? '')
  const togglePublish = useTogglePublishDeveloper(slug ?? '')
  const uploadImages = useUploadDeveloperImages(slug ?? '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', company_name: '', phone: '', email: '', city: '', country: '' },
  })

  useEffect(() => {
    if (developer) {
      reset({
        name: developer.name,
        company_name: developer.company_name,
        phone: developer.phone ?? '',
        email: developer.email ?? '',
        city: developer.city ?? '',
        country: developer.country ?? '',
      })
    }
  }, [developer, reset])

  if (isEdit && isLoading) return <LoadingState label="Loading developer…" />

  const onSubmit = (values: FormValues) => {
    if (isEdit && slug) {
      updateMutation.mutate(values, { onSuccess: () => navigate('/developers') })
    } else {
      createMutation.mutate(values, { onSuccess: () => navigate('/developers') })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/developers')}>
        <ArrowLeft className="h-4 w-4" /> Back to Developers
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">{isEdit ? 'Edit Developer' : 'New Developer'}</h1>
        {isEdit && developer && (
          <button type="button" onClick={() => togglePublish.mutate()} disabled={togglePublish.isPending}>
            <StatusBadge active={developer.is_published} onLabel="Published" offLabel="Publish" />
          </button>
        )}
      </div>

      {isEdit && developer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logo &amp; Cover</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="space-y-2 text-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={developer.logo_url ?? undefined} alt={developer.company_name} />
                <AvatarFallback>{developer.company_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadImages.mutate({ logo: file })
                  e.target.value = ''
                }}
              />
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => logoInputRef.current?.click()}>
                <Upload className="h-3 w-3" /> Logo
              </Button>
            </div>
            <div className="space-y-2 text-center">
              <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-md bg-muted">
                {developer.cover_image_url ? (
                  <img src={developer.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">No cover</span>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadImages.mutate({ cover_image: file })
                  e.target.value = ''
                }}
              />
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => coverInputRef.current?.click()}>
                <Upload className="h-3 w-3" /> Cover
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Contact name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company name</Label>
                <Input id="company_name" {...register('company_name')} />
                {errors.company_name && <p className="text-sm text-destructive">{errors.company_name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register('country')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          FAQs and read-only reviews are managed via separate endpoints — not yet built in this phase.
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/developers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create developer'}
          </Button>
        </div>
      </form>
    </div>
  )
}
