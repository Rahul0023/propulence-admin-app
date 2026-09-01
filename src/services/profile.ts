import { apiClient } from '@/lib/api-client'
import type { Profile, ProfileUpdateValues } from '@/types/profile'

export const profileApi = {
  get() {
    return apiClient.get<Profile>('/api/auth/me/profile/')
  },
  update(payload: Partial<ProfileUpdateValues>) {
    return apiClient.patch<Profile>('/api/auth/me/profile/', payload)
  },
  // UserProfilePictureUploadView converts to WEBP server-side. No serializer anywhere exposes a
  // profile_picture URL back to the client (confirmed: MyUser.profile_picture exists on the
  // model but isn't in MeSerializer or UserProfileSerializer's fields) — this is fire-and-forget.
  uploadPicture(image: File) {
    const form = new FormData()
    form.append('image', image)
    return apiClient.post('/api/auth/profile-picture/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
