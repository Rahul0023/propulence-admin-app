import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProjects } from '@/hooks/use-projects'
import { usePinterestBoards, useUploadPinterestVideo } from '@/hooks/use-pinterest'

const schema = z.object({
  project: z.string().min(1, 'Project is required'),
  board_id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().max(800, 'Description must be 800 characters or fewer').optional(),
  link: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface UploadPinterestVideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadPinterestVideoDialog({ open, onOpenChange }: UploadPinterestVideoDialogProps) {
  const [projectSearch, setProjectSearch] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const { data: projectsData } = useProjects({ page_size: 50, search: projectSearch })
  const { data: boards } = usePinterestBoards()
  const uploadVideo = useUploadPinterestVideo()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { project: '', board_id: '', title: '', description: '', link: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ project: '', board_id: '', title: '', description: '', link: '' })
      setProjectSearch('')
      setVideoFile(null)
      setCoverImage(null)
    }
  }, [open, reset])

  const canSubmit = !!videoFile && !!coverImage && !uploadVideo.isPending

  const onSubmit = (values: FormValues) => {
    if (!videoFile || !coverImage) return
    uploadVideo.mutate(
      {
        project_id: Number(values.project),
        board_id: values.board_id || undefined,
        title: values.title || undefined,
        description: values.description || undefined,
        link: values.link || undefined,
        video_file: videoFile,
        cover_image: coverImage,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Project</Label>
            <Input
              placeholder="Search projects to narrow the list below…"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="mb-2"
            />
            <Controller
              control={control}
              name="project"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsData?.results.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.project && <p className="text-sm text-destructive">{errors.project.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Board (optional)</Label>
            <Controller
              control={control}
              name="board_id"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Account default board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards?.map((b) => (
                      <SelectItem key={b.id} value={b.board_id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-title">Title (optional)</Label>
            <Input id="upload-title" {...register('title')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-description">Description (optional)</Label>
            <Textarea id="upload-description" rows={3} {...register('description')} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-link">Link (optional)</Label>
            <Input id="upload-link" placeholder="https://…" {...register('link')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-video-file">Video file (required)</Label>
            <Input
              id="upload-video-file"
              type="file"
              accept="video/mp4,video/quicktime,.mp4,.mov,.m4v"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-cover-image">Cover image (required — Pinterest requires one for video Pins)</Label>
            <Input
              id="upload-cover-image"
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {uploadVideo.isPending ? 'Uploading…' : 'Upload video'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
