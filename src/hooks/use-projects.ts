import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { projectsApi } from '@/services/projects'
import type { ProjectFormValues, ProjectListParams } from '@/types/project'

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useProject(id: number | undefined) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<ProjectFormValues>) => projectsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created')
    },
    onError: () => toast.error('Failed to create project'),
  })
}

export function useUpdateProject(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<ProjectFormValues>) => projectsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated')
    },
    onError: () => toast.error('Failed to update project'),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => projectsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: () => toast.error('Failed to delete project'),
  })
}

export function useProjectToggles(id: number) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['projects'] })

  const publish = useMutation({ mutationFn: () => projectsApi.togglePublish(id), onSuccess: invalidate })
  const featured = useMutation({ mutationFn: () => projectsApi.toggleFeatured(id), onSuccess: invalidate })

  return { publish, featured }
}
