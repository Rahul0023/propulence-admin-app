import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { propertiesApi } from '@/services/properties'
import type { PropertyFormValues, PropertyListParams } from '@/types/property'

export function useProperties(params: PropertyListParams) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertiesApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useProperty(id: number | undefined) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertiesApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<PropertyFormValues>) => propertiesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property created')
    },
    onError: () => toast.error('Failed to create property'),
  })
}

export function useUpdateProperty(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<PropertyFormValues>) => propertiesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property updated')
    },
    onError: () => toast.error('Failed to update property'),
  })
}

export function useDeleteProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => propertiesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property deleted')
    },
    onError: () => toast.error('Failed to delete property'),
  })
}

export function usePropertyToggles(id: number) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['properties'] })

  const verify = useMutation({ mutationFn: () => propertiesApi.toggleVerify(id), onSuccess: invalidate })
  const publish = useMutation({ mutationFn: () => propertiesApi.togglePublish(id), onSuccess: invalidate })
  const featured = useMutation({ mutationFn: () => propertiesApi.toggleFeatured(id), onSuccess: invalidate })

  return { verify, publish, featured }
}
