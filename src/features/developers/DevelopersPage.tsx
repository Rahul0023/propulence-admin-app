import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Download, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import { useDevelopers, useDeleteDeveloper } from '@/hooks/use-developers'
import { developersApi } from '@/services/developers'
import { downloadAuthenticated } from '@/lib/download'
import type { Developer } from '@/types/developer'

const PAGE_SIZE = 20

export function DevelopersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Developer | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, refetch } = useDevelopers({ page, page_size: PAGE_SIZE, search })
  const deleteDeveloper = useDeleteDeveloper()

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setIsImporting(true)
    try {
      await developersApi.bulkUpload(file)
      toast.success('Import started')
      refetch()
    } catch {
      toast.error('Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const columns: ColumnDef<Developer, unknown>[] = [
    {
      id: 'name',
      header: 'Developer',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={row.original.logo_url ?? undefined} alt={row.original.company_name} />
            <AvatarFallback>{row.original.company_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{row.original.company_name}</span>
        </div>
      ),
    },
    { accessorKey: 'city', header: 'City', cell: ({ row }) => row.original.city || '—' },
    { accessorKey: 'total_projects', header: 'Projects' },
    {
      id: 'flags',
      header: 'Flags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge active={row.original.is_verified} onLabel="Verified" offLabel="Unverified" />
          <StatusBadge active={row.original.is_published} onLabel="Published" offLabel="Draft" />
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
          <h1 className="font-serif text-2xl font-semibold">Developers</h1>
          <p className="text-sm text-muted-foreground">CRMDeveloperViewSet — slug-keyed, publish toggle only (no verify toggle exposed).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => downloadAuthenticated(developersApi.BULK_DOWNLOAD_PATH, 'developers.xlsx')}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleImportFile} />
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> {isImporting ? 'Importing…' : 'Import'}
          </Button>
          <Button size="sm" className="gap-2" onClick={() => navigate('/developers/new')}>
            <Plus className="h-4 w-4" /> New Developer
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search developers…"
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
        onRowClick={(row) => navigate(`/developers/${row.slug}/edit`)}
        emptyTitle="No developers yet"
        emptyDescription="Create one to get started."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.company_name || 'this developer'}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteDeveloper.mutate(deleteTarget.slug, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteDeveloper.isPending}
      />
    </div>
  )
}
