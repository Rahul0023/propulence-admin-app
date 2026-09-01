import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { heroBannersApi } from '@/services/hero-banners'
import type { AppHeroBannerFormValues, AppHeroBannerListParams } from '@/types/hero-banner'

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

export function useHeroBanners(params: AppHeroBannerListParams) {
  return useQuery({
    queryKey: ['hero-banners', params],
    queryFn: () => heroBannersApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useHeroBanner(id: number | undefined) {
  return useQuery({
    queryKey: ['hero-banners', id],
    queryFn: () => heroBannersApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateHeroBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, image }: { payload: Partial<AppHeroBannerFormValues>; image?: File | null }) =>
      heroBannersApi.create(payload, image),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hero-banners'] })
      toast.success('Hero banner created')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create hero banner')),
  })
}

export function useUpdateHeroBanner(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, image }: { payload: Partial<AppHeroBannerFormValues>; image?: File | null }) =>
      heroBannersApi.update(id, payload, image),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hero-banners'] })
      toast.success('Hero banner updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update hero banner')),
  })
}

export function useDeleteHeroBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => heroBannersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hero-banners'] })
      toast.success('Hero banner removed')
    },
    onError: () => toast.error('Failed to remove hero banner'),
  })
}
