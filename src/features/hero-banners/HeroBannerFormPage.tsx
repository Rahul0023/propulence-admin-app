import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/LoadingState'
import {
  useHeroBanner,
  useCreateHeroBanner,
  useUpdateHeroBanner,
} from '@/hooks/use-hero-banners'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  cta_label: z.string().optional(),
  cta_url: z.string().optional(),
  sort_order: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function HeroBannerFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const bannerId = id ? Number(id) : undefined
  const navigate = useNavigate()

  const [image, setImage] = useState<File | null>(null)

  const { data: banner, isLoading } = useHeroBanner(bannerId)
  const createMutation = useCreateHeroBanner()
  const updateMutation = useUpdateHeroBanner(bannerId ?? 0)

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
      subtitle: '',
      cta_label: '',
      cta_url: '',
      sort_order: '0',
      start_date: '',
      end_date: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title,
        subtitle: banner.subtitle ?? '',
        cta_label: banner.cta_label ?? '',
        cta_url: banner.cta_url ?? '',
        sort_order: String(banner.sort_order),
        start_date: banner.start_date ?? '',
        end_date: banner.end_date ?? '',
        is_active: banner.is_active,
      })
    }
  }, [banner, reset])

  if (isEdit && isLoading) return <LoadingState label="Loading hero banner…" />

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title,
      subtitle: values.subtitle || '',
      cta_label: values.cta_label || '',
      cta_url: values.cta_url || '',
      sort_order: values.sort_order ? Number(values.sort_order) : 0,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      is_active: values.is_active,
    }
    if (isEdit && bannerId) {
      updateMutation.mutate(
        { payload: payload as never, image },
        { onSuccess: () => navigate('/hero-banners') },
      )
    } else {
      createMutation.mutate(
        { payload: payload as never, image },
        { onSuccess: () => navigate('/hero-banners') },
      )
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/hero-banners')}>
        <ArrowLeft className="h-4 w-4" /> Back to Hero Banners
      </Button>

      <h1 className="font-serif text-2xl font-semibold">
        {isEdit ? 'Edit Hero Banner' : 'New Hero Banner'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Input id="subtitle" {...register('subtitle')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta_label">CTA label (optional)</Label>
                <Input id="cta_label" placeholder="e.g. Explore now" {...register('cta_label')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_url">CTA URL (optional)</Label>
                <Input id="cta_url" placeholder="https://…" {...register('cta_url')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image{!isEdit && ' (required)'}</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
              {banner?.image && !image && (
                <p className="text-xs text-muted-foreground">Leave blank to keep the current image.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rotation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start date (optional)</Label>
                <Input id="start_date" type="date" {...register('start_date')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End date (optional)</Label>
                <Input id="end_date" type="date" {...register('end_date')} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave both blank to keep this banner always eligible (no scheduling window).
            </p>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort order</Label>
              <Input id="sort_order" type="number" {...register('sort_order')} />
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/hero-banners')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create hero banner'}
          </Button>
        </div>
      </form>
    </div>
  )
}
