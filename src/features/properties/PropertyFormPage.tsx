import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/LoadingState'
import { StatusBadge } from '@/components/StatusBadge'
import { LISTING_TYPES, PROPERTY_TYPES, PROPERTY_STATUS } from '@/types/property'
import { useProperty, useCreateProperty, useUpdateProperty, usePropertyToggles } from '@/hooks/use-properties'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  listing_type: z.enum(LISTING_TYPES),
  property_type: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUS),
  price: z.string().optional(),
  builtup_area_sqft: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  formatted_address: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function PropertyFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const propertyId = id ? Number(id) : undefined
  const navigate = useNavigate()

  const { data: property, isLoading } = useProperty(propertyId)
  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty(propertyId ?? 0)
  const toggles = usePropertyToggles(propertyId ?? 0)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      listing_type: 'sale',
      property_type: 'apartment',
      status: 'available',
      price: '',
      builtup_area_sqft: '',
      bedrooms: '',
      bathrooms: '',
      formatted_address: '',
    },
  })

  useEffect(() => {
    if (property) {
      reset({
        title: property.title ?? '',
        description: property.description ?? '',
        listing_type: property.listing_type,
        property_type: property.property_type,
        status: property.status,
        price: property.price ?? '',
        builtup_area_sqft: property.builtup_area_sqft ?? '',
        bedrooms: property.bedrooms?.toString() ?? '',
        bathrooms: property.bathrooms?.toString() ?? '',
        formatted_address: property.formatted_address ?? '',
      })
    }
  }, [property, reset])

  if (isEdit && isLoading) return <LoadingState label="Loading property…" />

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      bedrooms: values.bedrooms ? Number(values.bedrooms) : null,
      bathrooms: values.bathrooms ? Number(values.bathrooms) : null,
    }
    if (isEdit && propertyId) {
      updateMutation.mutate(payload as never, { onSuccess: () => navigate('/properties') })
    } else {
      createMutation.mutate(payload as never, { onSuccess: () => navigate('/properties') })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/properties')}>
        <ArrowLeft className="h-4 w-4" /> Back to Properties
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">{isEdit ? 'Edit Property' : 'New Property'}</h1>
        {isEdit && property && (
          <div className="flex gap-2">
            <button type="button" onClick={() => toggles.verify.mutate()} disabled={toggles.verify.isPending}>
              <StatusBadge active={property.is_verified} onLabel="Verified" offLabel="Verify" />
            </button>
            <button type="button" onClick={() => toggles.publish.mutate()} disabled={toggles.publish.isPending}>
              <StatusBadge active={property.is_published} onLabel="Published" offLabel="Publish" />
            </button>
            <button type="button" onClick={() => toggles.featured.mutate()} disabled={toggles.featured.isPending}>
              <StatusBadge active={property.is_featured} onLabel="Featured" offLabel="Feature" />
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register('description')} />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Controller
                  control={control}
                  name="listing_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LISTING_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Property Type</Label>
                <Controller
                  control={control}
                  name="property_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_STATUS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing &amp; Area</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="builtup_area_sqft">Built-up area (sqft)</Label>
              <Input id="builtup_area_sqft" type="number" step="0.01" {...register('builtup_area_sqft')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" {...register('bedrooms')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" {...register('bathrooms')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="formatted_address">Address</Label>
            <Textarea id="formatted_address" rows={2} {...register('formatted_address')} />
            <p className="text-xs text-muted-foreground">
              City/locality assignment uses a geocoded field on the backend (editable=False) and needs a
              dedicated location picker — not built in this phase.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Media, floor plans, documents, and per-property nearby-facilities editing are out of scope for
          this phase — media/floor plans have no dedicated write endpoint beyond nested nested serializer
          fields, and per-property nearby-facilities/floor-plan CRUD doesn't exist on the backend.
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/properties')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create property'}
          </Button>
        </div>
      </form>
    </div>
  )
}
