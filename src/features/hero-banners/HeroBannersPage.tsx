import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import { useHeroBanners, useDeleteHeroBanner } from '@/hooks/use-hero-banners'
import type { AppHeroBanner } from '@/types/hero-banner'

const PAGE_SIZE = 20

export function HeroBannersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<AppHeroBanner | null>(null)

  const { data, isLoading, isError, refetch } = useHeroBanners({ page, page_size: PAGE_SIZE, search })
  const deleteHeroBanner = useDeleteHeroBanner()

  const columns: ColumnDef<AppHeroBanner, unknown>[] = [
    {
      id: 'banner',
      header: 'Banner',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.image ? (
            <img src={row.original.image} alt="" className="h-10 w-16 rounded object-cover" />
          ) : (
            <div className="h-10 w-16 rounded bg-muted" />
          )}
          <div>
            <div className="font-medium">{row.original.title}</div>
            {row.original.subtitle && <div className="text-xs text-muted-foreground">{row.original.subtitle}</div>}
          </div>
        </div>
      ),
    },
    { accessorKey: 'sort_order', header: 'Sort order' },
    {
      id: 'window',
      header: 'Active window',
      cell: ({ row }) =>
        row.original.start_date && row.original.end_date
          ? `${row.original.start_date} – ${row.original.end_date}`
          : 'Always on',
    },
    {
      id: 'is_active',
      header: 'Status',
      cell: ({ row }) => <StatusBadge active={row.original.is_active} onLabel="Active" offLabel="Inactive" />,
    },
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
        <div>
          <h1 className="font-serif text-2xl font-semibold">App Hero Banners</h1>
          <p className="text-sm text-muted-foreground">
            Manage the rotating hero banners shown on the app/home page.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => navigate('/hero-banners/new')}>
          <Plus className="h-4 w-4" /> New Hero Banner
        </Button>
      </div>

      <Input
        placeholder="Search by title…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="max-w-sm"
      />

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
        onRowClick={(row) => navigate(`/hero-banners/${row.id}/edit`)}
        emptyTitle="No hero banners yet"
        emptyDescription="Add one to feature it in the app's hero banner rotation."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Remove "${deleteTarget?.title || 'this hero banner'}"?`}
        description="This removes the banner from the rotation."
        onConfirm={() => {
          if (deleteTarget) deleteHeroBanner.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteHeroBanner.isPending}
      />
    </div>
  )
}
