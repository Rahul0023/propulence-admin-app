import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { profileApi } from '@/services/profile'
import type { ProfileUpdateValues } from '@/types/profile'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get().then((r) => r.data),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<ProfileUpdateValues>) => profileApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })
}

export function useUploadProfilePicture() {
  return useMutation({
    mutationFn: (image: File) => profileApi.uploadPicture(image),
    onSuccess: () => toast.success('Picture uploaded'),
    onError: () => toast.error('Failed to upload picture'),
  })
}
