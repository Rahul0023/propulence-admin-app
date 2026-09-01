import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { spotlightProjectsApi } from '@/services/spotlight-projects'
import type { SpotliteProjectFormValues, SpotliteProjectListParams } from '@/types/spotlight-project'

/** Backend returns a "non_field_errors" ValidationError for the 5-per-week-window overlap rule —
 * surface it distinctly from a generic failure toast so admins know *why* the save was rejected. */
function extractErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
  if (detail && typeof detail === 'object') {
    const nonField = detail.non_field_errors
    if (Array.isArray(nonField) && nonField.length) return String(nonField[0])
    const firstFieldError = Object.values(detail).find((v) => Array.isArray(v) && v.length)
    if (Array.isArray(firstFieldError)) return String(firstFieldError[0])
  }
  return fallback
}

export function useSpotlightProjects(params: SpotliteProjectListParams) {
  return useQuery({
    queryKey: ['spotlight-projects', params],
    queryFn: () => spotlightProjectsApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useSpotlightProject(id: number | undefined) {
  return useQuery({
    queryKey: ['spotlight-projects', id],
    queryFn: () => spotlightProjectsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateSpotlightProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, thumbnail }: { payload: Partial<SpotliteProjectFormValues>; thumbnail?: File | null }) =>
      spotlightProjectsApi.create(payload, thumbnail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spotlight-projects'] })
      toast.success('Spotlight project created')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create spotlight project')),
  })
}

export function useUpdateSpotlightProject(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, thumbnail }: { payload: Partial<SpotliteProjectFormValues>; thumbnail?: File | null }) =>
      spotlightProjectsApi.update(id, payload, thumbnail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spotlight-projects'] })
      toast.success('Spotlight project updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update spotlight project')),
  })
}

export function useDeleteSpotlightProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => spotlightProjectsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spotlight-projects'] })
      toast.success('Spotlight project removed')
    },
    onError: () => toast.error('Failed to remove spotlight project'),
  })
}
