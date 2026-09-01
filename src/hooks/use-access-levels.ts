import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { accessLevelsApi } from '@/services/access-levels'
import type { AccessLevelFormValues } from '@/types/access-level'

export function useAccessLevels() {
  return useQuery({
    queryKey: ['access-levels'],
    queryFn: () => accessLevelsApi.list().then((r) => r.data),
    // Reference data, edited rarely via a dialog that already invalidates this key on save —
    // no need for the 60s global default to force a refetch on every remount.
    staleTime: 5 * 60_000,
  })
}

export function useCreateAccessLevel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AccessLevelFormValues) => accessLevelsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['access-levels'] })
      toast.success('Access level created')
    },
    onError: () => toast.error('Failed to create access level'),
  })
}

export function useUpdateAccessLevel(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<AccessLevelFormValues>) => accessLevelsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['access-levels'] })
      toast.success('Access level updated')
    },
    onError: () => toast.error('Failed to update access level'),
  })
}

export function useDeleteAccessLevel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => accessLevelsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['access-levels'] })
      toast.success('Access level deleted')
    },
    onError: () => toast.error('Failed to delete access level'),
  })
}

export function useSeedCrmPresets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => accessLevelsApi.seedCrmPresets(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['access-levels'] })
      toast.success('CRM presets seeded')
    },
    onError: () => toast.error('Failed to seed presets'),
  })
}
