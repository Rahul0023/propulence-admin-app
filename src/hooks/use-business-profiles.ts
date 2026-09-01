import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { businessProfilesApi } from '@/services/business-profiles'
import type { BusinessProfileFormValues, BusinessProfileListParams } from '@/types/business-profile'

export function useBusinessProfiles(params: BusinessProfileListParams) {
  return useQuery({
    queryKey: ['business-profiles', params],
    queryFn: () => businessProfilesApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useBusinessProfile(id: number | undefined) {
  return useQuery({
    queryKey: ['business-profiles', id],
    queryFn: () => businessProfilesApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })
}

export function useBusinessProfileStats() {
  return useQuery({
    queryKey: ['business-profiles', 'stats'],
    queryFn: () => businessProfilesApi.stats().then((r) => r.data),
  })
}

export function useCreateBusinessProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ values, photo }: { values: BusinessProfileFormValues; photo?: File | null }) =>
      businessProfilesApi.create(values, photo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-profiles'] })
      toast.success('Business profile created')
    },
    onError: () => toast.error('Failed to create business profile'),
  })
}

export function useUpdateBusinessProfile(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ values, photo }: { values: Partial<BusinessProfileFormValues>; photo?: File | null }) =>
      businessProfilesApi.update(id, values, photo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-profiles'] })
      toast.success('Business profile updated')
    },
    onError: () => toast.error('Failed to update business profile'),
  })
}

export function useDeleteBusinessProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => businessProfilesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-profiles'] })
      toast.success('Business profile deleted')
    },
    onError: () => toast.error('Failed to delete business profile'),
  })
}

export function useRegenerateQr(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => businessProfilesApi.regenerateQr(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['business-profiles', id] })
      toast.success('QR code regenerated')
    },
    onError: () => toast.error('Failed to regenerate QR code'),
  })
}
