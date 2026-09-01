import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import {
  useBlogPosts,
  useDeleteBlogPost,
  useBlogCategories,
  useDeleteBlogCategory,
  useBlogTags,
  useDeleteBlogTag,
  useBlogAuthors,
  useDeleteBlogAuthor,
} from '@/hooks/use-blog-admin'
import { CategoryFormDialog } from '@/features/blog/CategoryFormDialog'
import { TagFormDialog } from '@/features/blog/TagFormDialog'
import { AuthorFormDialog } from '@/features/blog/AuthorFormDialog'
import type { BlogPostListItem, BlogCategory, BlogTag, BlogAuthor } from '@/types/blog'

const PAGE_SIZE = 20

function PostsTab() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<BlogPostListItem | null>(null)

  const { data, isLoading, isError, refetch } = useBlogPosts({ page, page_size: PAGE_SIZE, search })
  const deletePost = useDeleteBlogPost()

  const columns: ColumnDef<BlogPostListItem, unknown>[] = [
    {
      id: 'post',
      header: 'Post',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.hero_image ? (
            <img src={row.original.hero_image} alt="" className="h-10 w-16 rounded object-cover" />
          ) : (
            <div className="h-10 w-16 rounded bg-muted" />
          )}
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">{row.original.author?.full_name ?? 'No author'}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name ?? '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge active={row.original.status === 'PUBLISHED'} onLabel="Published" offLabel="Draft" />,
    },
    { accessorKey: 'view_count', header: 'Views' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteTarget(row.original)
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search by title…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />
        <Button size="sm" className="gap-2" onClick={() => navigate('/blog/posts/new')}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/blog/posts/${row.id}/edit`)}
        emptyTitle="No posts yet"
        emptyDescription="Create one to publish it on the blog."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title || 'this post'}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deletePost.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deletePost.isPending}
      />
    </div>
  )
}

function CategoriesTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useBlogCategories({ page, page_size: PAGE_SIZE })
  const deleteCategory = useDeleteBlogCategory()
  const [editTarget, setEditTarget] = useState<BlogCategory | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<BlogCategory | null>(null)

  const columns: ColumnDef<BlogCategory, unknown>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteTarget(row.original)
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={() => setEditTarget(null)}>
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        onRowClick={(row) => setEditTarget(row)}
        emptyTitle="No categories yet"
        emptyDescription="Create one to organize blog posts."
      />

      <CategoryFormDialog open={editTarget !== undefined} onOpenChange={(open) => !open && setEditTarget(undefined)} category={editTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name || 'this category'}"?`}
        description="Posts using this category will keep their category field cleared."
        onConfirm={() => {
          if (deleteTarget) deleteCategory.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}

function TagsTab() {
  const { data, isLoading, isError, refetch } = useBlogTags({ page_size: 100 })
  const deleteTag = useDeleteBlogTag()
  const [editTarget, setEditTarget] = useState<BlogTag | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<BlogTag | null>(null)

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading tags…</p>
  if (isError) return <p className="text-sm text-destructive">Could not load tags. <button className="underline" onClick={() => refetch()}>Retry</button></p>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={() => setEditTarget(null)}>
          <Plus className="h-4 w-4" /> New Tag
        </Button>
      </div>

      {!data?.results.length ? (
        <p className="text-sm text-muted-foreground">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.results.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="cursor-pointer gap-2 py-1.5 pl-3 pr-2"
              onClick={() => setEditTarget(tag)}
            >
              {tag.name}
              <button
                aria-label="Delete"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(tag)
                }}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <TagFormDialog open={editTarget !== undefined} onOpenChange={(open) => !open && setEditTarget(undefined)} tag={editTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name || 'this tag'}"?`}
        description="Posts using this tag will have it removed."
        onConfirm={() => {
          if (deleteTarget) deleteTag.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteTag.isPending}
      />
    </div>
  )
}

function AuthorsTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useBlogAuthors({ page, page_size: PAGE_SIZE })
  const deleteAuthor = useDeleteBlogAuthor()
  const [editTarget, setEditTarget] = useState<BlogAuthor | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<BlogAuthor | null>(null)

  const columns: ColumnDef<BlogAuthor, unknown>[] = [
    {
      id: 'author',
      header: 'Author',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.profile_image ? (
            <img src={row.original.profile_image} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted" />
          )}
          <div>
            <div className="font-medium">{row.original.full_name}</div>
            {row.original.designation && <div className="text-xs text-muted-foreground">{row.original.designation}</div>}
          </div>
        </div>
      ),
    },
    { accessorKey: 'company', header: 'Company' },
    { accessorKey: 'posts_count', header: 'Posts' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteTarget(row.original)
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={() => setEditTarget(null)}>
          <Plus className="h-4 w-4" /> New Author
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.results ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        onRowClick={(row) => setEditTarget(row)}
        emptyTitle="No authors yet"
        emptyDescription="Create one before writing posts — posts require an author."
      />

      <AuthorFormDialog open={editTarget !== undefined} onOpenChange={(open) => !open && setEditTarget(undefined)} author={editTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.full_name || 'this author'}"?`}
        description="This fails if the author still has posts assigned — reassign those posts first."
        onConfirm={() => {
          if (deleteTarget) deleteAuthor.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteAuthor.isPending}
      />
    </div>
  )
}

export function BlogPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Blog</h1>
        <p className="text-sm text-muted-foreground">Manage posts, categories, tags, and authors.</p>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-4">
          <PostsTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="tags" className="mt-4">
          <TagsTab />
        </TabsContent>
        <TabsContent value="authors" className="mt-4">
          <AuthorsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
