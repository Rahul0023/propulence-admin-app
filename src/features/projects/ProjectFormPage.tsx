import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/LoadingState'
import { StatusBadge } from '@/components/StatusBadge'
import { PROJECT_TYPES, PROJECT_STATUS } from '@/types/project'
import { useProject, useCreateProject, useUpdateProject, useProjectToggles } from '@/hooks/use-projects'
import { useDevelopers } from '@/hooks/use-developers'

const schema = z.object({
  developer: z.string().min(1, 'Developer is required'),
  name: z.string().min(1, 'Name is required'),
  short_description: z.string().optional(),
  description: z.string().optional(),
  project_type: z.enum(PROJECT_TYPES),
  status: z.enum(PROJECT_STATUS),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
  total_units: z.string().optional(),
  location: z.string().optional(),
  rera_number: z.string().optional(),
  rera_authority: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProjectFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const projectId = id ? Number(id) : undefined
  const navigate = useNavigate()

  const { data: project, isLoading } = useProject(projectId)
  const { data: developersData } = useDevelopers({ page_size: 100 })
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject(projectId ?? 0)
  const toggles = useProjectToggles(projectId ?? 0)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      developer: '',
      name: '',
      short_description: '',
      description: '',
      project_type: 'residential',
      status: 'planning',
      min_price: '',
      max_price: '',
      total_units: '',
      location: '',
      rera_number: '',
      rera_authority: '',
    },
  })

  useEffect(() => {
    if (project) {
      reset({
        developer: String(project.developer),
        name: project.name,
        short_description: project.short_description ?? '',
        description: project.description ?? '',
        project_type: project.project_type,
        status: project.status,
        min_price: project.min_price ?? '',
        max_price: project.max_price ?? '',
        total_units: project.total_units?.toString() ?? '',
        location: project.location ?? '',
        rera_number: project.rera_number ?? '',
        rera_authority: project.rera_authority ?? '',
      })
    }
  }, [project, reset])

  if (isEdit && isLoading) return <LoadingState label="Loading project…" />

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      developer: Number(values.developer),
      total_units: values.total_units ? Number(values.total_units) : null,
    }
    if (isEdit && projectId) {
      updateMutation.mutate(payload as never, { onSuccess: () => navigate('/projects') })
    } else {
      createMutation.mutate(payload as never, { onSuccess: () => navigate('/projects') })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/projects')}>
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">{isEdit ? 'Edit Project' : 'New Project'}</h1>
        {isEdit && project && (
          <div className="flex gap-2">
            <button type="button" onClick={() => toggles.publish.mutate()} disabled={toggles.publish.isPending}>
              <StatusBadge active={project.is_published} onLabel="Published" offLabel="Publish" />
            </button>
            <button type="button" onClick={() => toggles.featured.mutate()} disabled={toggles.featured.isPending}>
              <StatusBadge active={project.is_featured} onLabel="Featured" offLabel="Feature" />
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Developer</Label>
              <Controller
                control={control}
                name="developer"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a developer" />
                    </SelectTrigger>
                    <SelectContent>
                      {developersData?.results.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.developer && <p className="text-sm text-destructive">{errors.developer.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short description</Label>
              <Input id="short_description" {...register('short_description')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register('description')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Type</Label>
                <Controller
                  control={control}
                  name="project_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_TYPES.map((t) => (
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
                        {PROJECT_STATUS.map((t) => (
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
            <CardTitle className="text-base">Pricing &amp; Units</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_price">Min price (₹)</Label>
              <Input id="min_price" type="number" step="0.01" {...register('min_price')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_price">Max price (₹)</Label>
              <Input id="max_price" type="number" step="0.01" {...register('max_price')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_units">Total units</Label>
              <Input id="total_units" type="number" {...register('total_units')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location &amp; RERA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rera_number">RERA number</Label>
                <Input id="rera_number" {...register('rera_number')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rera_authority">RERA authority</Label>
                <Input id="rera_authority" {...register('rera_authority')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          Layouts, towers, floor plans, amenities, highlights, FAQs, and nearby facilities are managed
          via separate nested endpoints on the backend — not yet built in this phase.
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </div>
  )
}
