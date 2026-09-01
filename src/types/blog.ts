/**
 * apps/article/models.py's Author/Category/Tag/Post, via apps/superadmin/views/views_article.py
 * (AuthorViewSet, CategoryViewSet, TagViewSet, PostViewSet) +
 * apps/superadmin/serializers/serializers_article.py, mounted at /api/superadmin/.
 */
export interface BlogAuthor {
  id: number
  profile_image: string | null
  first_name: string
  last_name: string
  full_name: string
  designation: string
  company: string
  email: string
  bio: string
  website: string
  posts_count: number
  created_at: string
}

export type BlogAuthorFormValues = Pick<
  BlogAuthor,
  'first_name' | 'last_name' | 'designation' | 'company' | 'email' | 'bio' | 'website'
>

export interface BlogCategory {
  id: number
  name: string
  slug: string
  description: string | null
}

export type BlogCategoryFormValues = Pick<BlogCategory, 'name' | 'description'>

export interface BlogTag {
  id: number
  name: string
  slug: string
}

export type BlogTagFormValues = Pick<BlogTag, 'name'>

export interface BlogPostAuthorRef {
  id: number
  full_name: string
  email: string
}

export type BlogPostStatus = 'DRAFT' | 'PUBLISHED'

export interface BlogPostListItem {
  id: number
  title: string
  slug: string
  excerpt: string
  status: BlogPostStatus
  published_at: string | null
  created_at: string
  updated_at: string
  hero_image: string | null
  allow_comments: boolean
  view_count: number
  author: BlogPostAuthorRef | null
  category: BlogCategory | null
  tags: BlogTag[]
}

export interface BlogPostDetail extends BlogPostListItem {
  content: string
}

export interface BlogPostFormValues {
  title: string
  excerpt: string
  content: string
  status: BlogPostStatus
  published_at: string | null
  author_id: number
  category_id: number | null
  tag_ids: number[]
  allow_comments: boolean
}

export interface BlogListParams {
  page?: number
  page_size?: number
  search?: string
}
