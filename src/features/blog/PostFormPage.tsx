import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/LoadingState'
import { RichTextEditor } from '@/features/blog/RichTextEditor'
import { useBlogPost, useCreateBlogPost, useUpdateBlogPost } from '@/hooks/use-blog-admin'
import { useBlogAuthors, useBlogCategories, useBlogTags } from '@/hooks/use-blog-admin'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional(),
  author_id: z.string().min(1, 'Author is required'),
  category_id: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  published_at: z.string().optional(),
  allow_comments: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function PostFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const postId = id ? Number(id) : undefined
  const navigate = useNavigate()

  const [content, setContent] = useState('')
  const [tagIds, setTagIds] = useState<number[]>([])
  const [heroImage, setHeroImage] = useState<File | null>(null)

  const { data: post, isLoading } = useBlogPost(postId)
  const { data: authorsData, isLoading: authorsLoading } = useBlogAuthors({ page_size: 100 })
  const { data: categoriesData, isLoading: categoriesLoading } = useBlogCategories({ page_size: 100 })
  const { data: tagsData, isLoading: tagsLoading } = useBlogTags({ page_size: 100 })
  const createMutation = useCreateBlogPost()
  const updateMutation = useUpdateBlogPost(postId ?? 0)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      excerpt: '',
      author_id: '',
      category_id: '',
      status: 'DRAFT',
      published_at: '',
      allow_comments: true,
    },
  })

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        excerpt: post.excerpt ?? '',
        author_id: post.author ? String(post.author.id) : '',
        category_id: post.category ? String(post.category.id) : '',
        status: post.status,
        published_at: post.published_at ? post.published_at.slice(0, 16) : '',
        allow_comments: post.allow_comments,
      })
      setContent(post.content ?? '')
      setTagIds(post.tags.map((t) => t.id))
    }
  }, [post, reset])

  // Wait for the author/category/tag option lists before rendering the form — Radix's Select
  // only resolves a controlled value to a visible label once its SelectItem has rendered at
  // least once, so reset()'ing the author/category fields before those lists arrive leaves the
  // dropdowns showing their placeholder despite holding a valid selected id underneath.
  if ((isEdit && isLoading) || authorsLoading || categoriesLoading || tagsLoading) {
    return <LoadingState label="Loading post…" />
  }

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title,
      excerpt: values.excerpt || '',
      content,
      author_id: Number(values.author_id),
      category_id: values.category_id ? Number(values.category_id) : null,
      tag_ids: tagIds,
      status: values.status,
      published_at: values.published_at ? new Date(values.published_at).toISOString() : null,
      allow_comments: values.allow_comments,
    }
    const onSuccess = () => navigate('/blog')
    if (isEdit && postId) {
      updateMutation.mutate({ payload: payload as never, heroImage }, { onSuccess })
    } else {
      createMutation.mutate({ payload: payload as never, heroImage }, { onSuccess })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/blog')}>
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Button>

      <h1 className="font-serif text-2xl font-semibold">{isEdit ? 'Edit Post' : 'New Post'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (optional)</Label>
              <Textarea id="excerpt" rows={2} {...register('excerpt')} />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_image">Hero image</Label>
              <Input id="hero_image" type="file" accept="image/*" onChange={(e) => setHeroImage(e.target.files?.[0] ?? null)} />
              {post?.hero_image && !heroImage && (
                <p className="text-xs text-muted-foreground">Leave blank to keep the current image.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Author</Label>
                <Controller
                  control={control}
                  name="author_id"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an author" />
                      </SelectTrigger>
                      <SelectContent>
                        {authorsData?.results.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.author_id && <p className="text-sm text-destructive">{errors.author_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Category (optional)</Label>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="No category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData?.results.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-3 rounded-md border p-3">
                {tagsData?.results.length ? (
                  tagsData.results.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={tagIds.includes(tag.id)}
                        onCheckedChange={(checked) =>
                          setTagIds((prev) => (checked ? [...prev, tag.id] : prev.filter((id) => id !== tag.id)))
                        }
                      />
                      {tag.name}
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tags yet — add some from the Blog &gt; Tags tab.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="published_at">Published at (optional)</Label>
                <Input id="published_at" type="datetime-local" {...register('published_at')} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="allow_comments"
                render={({ field }) => <Switch id="allow_comments" checked={field.value} onCheckedChange={field.onChange} />}
              />
              <Label htmlFor="allow_comments">Allow comments</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/blog')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
          </Button>
        </div>
      </form>
    </div>
  )
}
