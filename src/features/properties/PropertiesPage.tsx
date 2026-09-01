import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Download, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useProperties, useDeleteProperty } from '@/hooks/use-properties'
import { propertiesApi } from '@/services/properties'
import { downloadAuthenticated } from '@/lib/download'
import type { Property } from '@/types/property'

const PAGE_SIZE = 20

export function PropertiesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)

  const { data, isLoading, isError, refetch } = useProperties({ page, page_size: PAGE_SIZE, search })
  const deleteProperty = useDeleteProperty()

  const columns: ColumnDef<Property, unknown>[] = [
    { accessorKey: 'title', header: 'Title', cell: ({ row }) => row.original.title || '—' },
    { accessorKey: 'listing_type', header: 'Type' },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (row.original.price ? `₹${Number(row.original.price).toLocaleString('en-IN')}` : '—'),
    },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge> },
    {
      id: 'flags',
      header: 'Flags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge active={row.original.is_verified} onLabel="Verified" offLabel="Unverified" />
          <StatusBadge active={row.original.is_published} onLabel="Published" offLabel="Draft" />
          {row.original.is_featured && <Badge variant="warning">Featured</Badge>}
        </div>
      ),
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
          <h1 className="font-serif text-2xl font-semibold">Properties</h1>
          <p className="text-sm text-muted-foreground">CRMPropertyViewSet — verify/publish/featured are independent toggles, not a status workflow.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" disabled className="gap-2">
                <Upload className="h-4 w-4" /> Import
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon — no bulk-import endpoint exists on the backend for properties</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => downloadAuthenticated(propertiesApi.DOWNLOAD_PATH, 'properties.xlsx')}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-2" onClick={() => navigate('/properties/new')}>
            <Plus className="h-4 w-4" /> New Property
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search properties…"
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
        onRowClick={(row) => navigate(`/properties/${row.id}/edit`)}
        emptyTitle="No properties yet"
        emptyDescription="Create one to get started."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title || 'this property'}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteProperty.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteProperty.isPending}
      />
    </div>
  )
}
