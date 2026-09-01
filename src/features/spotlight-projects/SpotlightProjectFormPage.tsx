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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/LoadingState'
import {
  useSpotlightProject,
  useCreateSpotlightProject,
  useUpdateSpotlightProject,
} from '@/hooks/use-spotlight-projects'
import { useProjects } from '@/hooks/use-projects'

const schema = z.object({
  project: z.string().min(1, 'Project is required'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sort_order: z.string().optional(),
  week_start: z.string().optional(),
  week_end: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function SpotlightProjectFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const spotlightId = id ? Number(id) : undefined
  const navigate = useNavigate()

  const [projectSearch, setProjectSearch] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)

  const { data: spotlight, isLoading } = useSpotlightProject(spotlightId)
  const { data: projectsData } = useProjects({ page_size: 50, search: projectSearch })
  const createMutation = useCreateSpotlightProject()
  const updateMutation = useUpdateSpotlightProject(spotlightId ?? 0)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      project: '',
      title: '',
      subtitle: '',
      sort_order: '0',
      week_start: '',
      week_end: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (spotlight) {
      reset({
        project: String(spotlight.project),
        title: spotlight.title ?? '',
        subtitle: spotlight.subtitle ?? '',
        sort_order: String(spotlight.sort_order),
        week_start: spotlight.week_start ?? '',
        week_end: spotlight.week_end ?? '',
        is_active: spotlight.is_active,
      })
    }
  }, [spotlight, reset])

  if (isEdit && isLoading) return <LoadingState label="Loading spotlight project…" />

  const onSubmit = (values: FormValues) => {
    const payload = {
      project: Number(values.project),
      title: values.title || null,
      subtitle: values.subtitle || null,
      sort_order: values.sort_order ? Number(values.sort_order) : 0,
      week_start: values.week_start || null,
      week_end: values.week_end || null,
      is_active: values.is_active,
    }
    if (isEdit && spotlightId) {
      updateMutation.mutate(
        { payload: payload as never, thumbnail },
        { onSuccess: () => navigate('/spotlight-projects') },
      )
    } else {
      createMutation.mutate(
        { payload: payload as never, thumbnail },
        { onSuccess: () => navigate('/spotlight-projects') },
      )
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/spotlight-projects')}>
        <ArrowLeft className="h-4 w-4" /> Back to Spotlight Projects
      </Button>

      <h1 className="font-serif text-2xl font-semibold">
        {isEdit ? 'Edit Spotlight Project' : 'New Spotlight Project'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Input
                placeholder="Search projects to narrow the list below…"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="mb-2"
              />
              <Controller
                control={control}
                name="project"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsData?.results.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.project && <p className="text-sm text-destructive">{errors.project.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title override (optional)</Label>
              <Input id="title" placeholder="Defaults to the project's name" {...register('title')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Input id="subtitle" {...register('subtitle')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
              />
              {spotlight?.thumbnail && !thumbnail && (
                <p className="text-xs text-muted-foreground">Leave blank to keep the current thumbnail.</p>
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
                <Label htmlFor="week_start">Week start (optional)</Label>
                <Input id="week_start" type="date" {...register('week_start')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="week_end">Week end (optional)</Label>
                <Input id="week_end" type="date" {...register('week_end')} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave both blank to keep this project always eligible (no scheduling window). At most 5
              active rows may overlap any given week — the server rejects a 6th.
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
          <Button type="button" variant="outline" onClick={() => navigate('/spotlight-projects')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create spotlight project'}
          </Button>
        </div>
      </form>
    </div>
  )
}
