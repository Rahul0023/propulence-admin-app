import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { developersApi } from '@/services/developers'
import type { DeveloperCreateValues, DeveloperUpdateValues, DeveloperListParams } from '@/types/developer'

export function useDevelopers(params: DeveloperListParams) {
  return useQuery({
    queryKey: ['developers', params],
    queryFn: () => developersApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useDeveloper(slug: string | undefined) {
  return useQuery({
    queryKey: ['developers', slug],
    queryFn: () => developersApi.get(slug!).then((r) => r.data),
    enabled: !!slug,
  })
}

export function useCreateDeveloper() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeveloperCreateValues) => developersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['developers'] })
      toast.success('Developer created')
    },
    onError: () => toast.error('Failed to create developer'),
  })
}

export function useUpdateDeveloper(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeveloperUpdateValues) => developersApi.update(slug, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['developers'] })
      toast.success('Developer updated')
    },
    onError: () => toast.error('Failed to update developer'),
  })
}

export function useDeleteDeveloper() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => developersApi.remove(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['developers'] })
      toast.success('Developer deleted')
    },
    onError: () => toast.error('Failed to delete developer'),
  })
}

export function useTogglePublishDeveloper(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => developersApi.togglePublish(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['developers'] }),
  })
}

export function useUploadDeveloperImages(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (files: { logo?: File; cover_image?: File }) => developersApi.uploadImages(slug, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['developers'] })
      toast.success('Images updated')
    },
    onError: () => toast.error('Failed to upload images'),
  })
}
