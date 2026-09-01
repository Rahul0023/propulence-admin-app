import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { blogAuthorsApi, blogCategoriesApi, blogTagsApi, blogPostsApi } from '@/services/blog-admin'
import type {
  BlogAuthorFormValues,
  BlogCategoryFormValues,
  BlogTagFormValues,
  BlogPostFormValues,
  BlogListParams,
} from '@/types/blog'

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

// ---------------------------
// Authors
// ---------------------------
export function useBlogAuthors(params: BlogListParams = {}) {
  return useQuery({
    queryKey: ['blog-authors', params],
    queryFn: () => blogAuthorsApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useCreateBlogAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, image }: { payload: Partial<BlogAuthorFormValues>; image?: File | null }) =>
      blogAuthorsApi.create(payload).then(async (res) => {
        if (image) await blogAuthorsApi.uploadProfileImage(res.data.id, image)
        return res
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-authors'] })
      toast.success('Author created')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create author')),
  })
}

export function useUpdateBlogAuthor(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, image }: { payload: Partial<BlogAuthorFormValues>; image?: File | null }) =>
      blogAuthorsApi.update(id, payload).then(async (res) => {
        if (image) await blogAuthorsApi.uploadProfileImage(id, image)
        return res
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-authors'] })
      toast.success('Author updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update author')),
  })
}

export function useDeleteBlogAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => blogAuthorsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-authors'] })
      toast.success('Author deleted')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete author')),
  })
}

// ---------------------------
// Categories
// ---------------------------
export function useBlogCategories(params: BlogListParams = {}) {
  return useQuery({
    queryKey: ['blog-categories', params],
    queryFn: () => blogCategoriesApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useCreateBlogCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<BlogCategoryFormValues>) => blogCategoriesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
      toast.success('Category created')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create category')),
  })
}

export function useUpdateBlogCategory(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<BlogCategoryFormValues>) => blogCategoriesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
      toast.success('Category updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update category')),
  })
}

export function useDeleteBlogCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => blogCategoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-categories'] })
      toast.success('Category deleted')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete category')),
  })
}

// ---------------------------
// Tags
// ---------------------------
export function useBlogTags(params: BlogListParams = {}) {
  return useQuery({
    queryKey: ['blog-tags', params],
    queryFn: () => blogTagsApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useCreateBlogTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<BlogTagFormValues>) => blogTagsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-tags'] })
      toast.success('Tag created')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create tag')),
  })
}

export function useUpdateBlogTag(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<BlogTagFormValues>) => blogTagsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-tags'] })
      toast.success('Tag updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update tag')),
  })
}

export function useDeleteBlogTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => blogTagsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-tags'] })
      toast.success('Tag deleted')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete tag')),
  })
}

// ---------------------------
// Posts
// ---------------------------
export function useBlogPosts(params: BlogListParams & { status?: string } = {}) {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => blogPostsApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useBlogPost(id: number | undefined) {
  return useQuery({
    queryKey: ['blog-posts', id],
    queryFn: () => blogPostsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, heroImage }: { payload: Partial<BlogPostFormValues>; heroImage?: File | null }) =>
      blogPostsApi.create(payload, heroImage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Post created')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create post')),
  })
}

export function useUpdateBlogPost(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, heroImage }: { payload: Partial<BlogPostFormValues>; heroImage?: File | null }) =>
      blogPostsApi.update(id, payload, heroImage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Post updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update post')),
  })
}

export function useDeleteBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => blogPostsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Post deleted')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete post')),
  })
}
