import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { RefreshCw, Ban, Pencil, Sparkles, ExternalLink, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/data-table/DataTable'
import { usePinterestPins, useRetryPinterestPin, useUnpublishPinterestPin, useRegeneratePinterestDescription } from '@/hooks/use-pinterest'
import { EditPinDescriptionDialog } from '@/features/pinterest/EditPinDescriptionDialog'
import { UploadPinterestVideoDialog } from '@/features/pinterest/UploadPinterestVideoDialog'
import type { PinterestPin, PinterestPinStatus } from '@/types/pinterest'

const PAGE_SIZE = 20

const STATUS_VARIANT: Record<PinterestPinStatus, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  draft: 'secondary',
  publishing: 'warning',
  published: 'success',
  failed: 'destructive',
  unpublished: 'secondary',
}

export function PinterestPinsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<PinterestPinStatus | 'ALL'>('ALL')
  const [editTarget, setEditTarget] = useState<PinterestPin | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const { data, isLoading, isError, refetch } = usePinterestPins({
    page,
    page_size: PAGE_SIZE,
    status: status === 'ALL' ? undefined : status,
  })
  const retry = useRetryPinterestPin()
  const unpublish = useUnpublishPinterestPin()
  const regenerate = useRegeneratePinterestDescription()

  const columns: ColumnDef<PinterestPin, unknown>[] = [
    {
      id: 'thumbnail',
      header: '',
      cell: ({ row }) => {
        const src = row.original.cover_image_url || row.original.image_url
        return src ? (
          <img src={src} alt="" className="h-12 w-12 rounded object-cover" />
        ) : (
          <div className="h-12 w-12 rounded bg-muted" />
        )
      },
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <div>{row.original.title || '—'}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.media_type === 'video' ? 'Video' : 'Image'} ·{' '}
            {row.original.source_type === 'manual_video' ? 'Manual upload' : 'Floor plan'}
          </div>
        </div>
      ),
    },
    {
      id: 'project',
      header: 'Project',
      cell: ({ row }) => (row.original.project_id ? `Project #${row.original.project_id}` : '—'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('en-IN'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const pin = row.original
        return (
          <div className="flex items-center gap-1">
            {pin.permalink && (
              <Button variant="ghost" size="icon" aria-label="View on Pinterest" asChild>
                <a href={pin.permalink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {pin.status === 'failed' && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Retry"
                onClick={(e) => {
                  e.stopPropagation()
                  retry.mutate(pin.id)
                }}
                disabled={retry.isPending}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {pin.status === 'published' && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Unpublish"
                onClick={(e) => {
                  e.stopPropagation()
                  unpublish.mutate(pin.id)
                }}
                disabled={unpublish.isPending}
              >
                <Ban className="h-4 w-4 text-destructive" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit description"
              onClick={(e) => {
                e.stopPropagation()
                setEditTarget(pin)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {pin.source_type === 'floor_plan' && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Regenerate description"
                onClick={(e) => {
                  e.stopPropagation()
                  regenerate.mutate(pin.id)
                }}
                disabled={regenerate.isPending}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Pinterest Pins</h1>
          <p className="text-sm text-muted-foreground">
            Floor plans are published automatically. Monitor status and manage pins here.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setUploadOpen(true)}>
          <Video className="h-4 w-4" /> Upload Video
        </Button>
      </div>

      <Select
        value={status}
        onValueChange={(v) => {
          setStatus(v as PinterestPinStatus | 'ALL')
          setPage(1)
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="publishing">Publishing</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="unpublished">Unpublished</SelectItem>
        </SelectContent>
      </Select>

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
        emptyTitle="No pins yet"
        emptyDescription="Pins are created automatically when floor plans are added, or upload a video manually."
      />

      <EditPinDescriptionDialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)} pin={editTarget} />
      <UploadPinterestVideoDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
