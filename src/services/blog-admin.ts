import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type {
  BlogAuthor,
  BlogAuthorFormValues,
  BlogCategory,
  BlogCategoryFormValues,
  BlogTag,
  BlogTagFormValues,
  BlogPostListItem,
  BlogPostDetail,
  BlogPostFormValues,
  BlogListParams,
} from '@/types/blog'

const BASE = '/api/superadmin'

function toFormData(payload: Record<string, unknown>, fileKey: string, file?: File | null) {
  if (!file) return payload
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((v) => form.append(key, String(v)))
    } else {
      form.append(key, String(value))
    }
  })
  form.append(fileKey, file)
  return form
}

export const blogAuthorsApi = {
  list(params: BlogListParams = {}) {
    return apiClient.get<PaginatedResponse<BlogAuthor>>(`${BASE}/authors/`, { params })
  },
  get(id: number) {
    return apiClient.get<BlogAuthor>(`${BASE}/authors/${id}/`)
  },
  create(payload: Partial<BlogAuthorFormValues>) {
    return apiClient.post<BlogAuthor>(`${BASE}/authors/`, payload)
  },
  update(id: number, payload: Partial<BlogAuthorFormValues>) {
    return apiClient.patch<BlogAuthor>(`${BASE}/authors/${id}/`, payload)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}/authors/${id}/`)
  },
  uploadProfileImage(id: number, image: File) {
    const form = new FormData()
    form.append('profile_image', image)
    return apiClient.post<BlogAuthor>(`${BASE}/authors/${id}/upload-profile-image/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const blogCategoriesApi = {
  list(params: BlogListParams = {}) {
    return apiClient.get<PaginatedResponse<BlogCategory>>(`${BASE}/categories/`, { params })
  },
  create(payload: Partial<BlogCategoryFormValues>) {
    return apiClient.post<BlogCategory>(`${BASE}/categories/`, payload)
  },
  update(id: number, payload: Partial<BlogCategoryFormValues>) {
    return apiClient.patch<BlogCategory>(`${BASE}/categories/${id}/`, payload)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}/categories/${id}/`)
  },
}

export const blogTagsApi = {
  list(params: BlogListParams = {}) {
    return apiClient.get<PaginatedResponse<BlogTag>>(`${BASE}/tags/`, { params })
  },
  create(payload: Partial<BlogTagFormValues>) {
    return apiClient.post<BlogTag>(`${BASE}/tags/`, payload)
  },
  update(id: number, payload: Partial<BlogTagFormValues>) {
    return apiClient.patch<BlogTag>(`${BASE}/tags/${id}/`, payload)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}/tags/${id}/`)
  },
}

export const blogPostsApi = {
  list(params: BlogListParams & { status?: string; category?: number; author?: number } = {}) {
    return apiClient.get<PaginatedResponse<BlogPostListItem>>(`${BASE}/posts/`, { params })
  },
  get(id: number) {
    return apiClient.get<BlogPostDetail>(`${BASE}/posts/${id}/`)
  },
  create(payload: Partial<BlogPostFormValues>, heroImage?: File | null) {
    const body = toFormData(payload, 'hero_image', heroImage)
    return apiClient.post<BlogPostDetail>(`${BASE}/posts/`, body, heroImage ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },
  update(id: number, payload: Partial<BlogPostFormValues>, heroImage?: File | null) {
    const body = toFormData(payload, 'hero_image', heroImage)
    return apiClient.patch<BlogPostDetail>(`${BASE}/posts/${id}/`, body, heroImage ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },
  remove(id: number) {
    return apiClient.delete(`${BASE}/posts/${id}/`)
  },
}
