import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Download, Upload, FileSpreadsheet, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjects, useDeleteProject } from '@/hooks/use-projects'
import { projectsApi } from '@/services/projects'
import { downloadAuthenticated } from '@/lib/download'
import type { Project } from '@/types/project'

const PAGE_SIZE = 20

export function ProjectsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, refetch } = useProjects({ page, page_size: PAGE_SIZE, search })
  const deleteProject = useDeleteProject()

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setIsImporting(true)
    try {
      await projectsApi.importFile(file)
      toast.success('Import started')
      refetch()
    } catch {
      toast.error('Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const columns: ColumnDef<Project, unknown>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'project_type', header: 'Type' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline">{row.original.status.replace('_', ' ')}</Badge> },
    {
      id: 'price_range',
      header: 'Price range',
      cell: ({ row }) =>
        row.original.min_price
          ? `₹${Number(row.original.min_price).toLocaleString('en-IN')} – ₹${Number(row.original.max_price ?? row.original.min_price).toLocaleString('en-IN')}`
          : '—',
    },
    {
      id: 'flags',
      header: 'Flags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge active={row.original.is_published} onLabel="Published" offLabel="Draft" />
          {row.original.is_featured && <Badge variant="warning">Featured</Badge>}
          {row.original.rera_number && <Badge variant="secondary">RERA</Badge>}
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
          <h1 className="font-serif text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            ProjectViewSet — no verify toggle (dead on the backend); no construction-updates timeline,
            only a single status field.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => downloadAuthenticated(projectsApi.TEMPLATE_CSV_PATH, 'projects-template.csv')}>
                CSV template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadAuthenticated(projectsApi.TEMPLATE_XLSX_PATH, 'projects-template.xlsx')}>
                Excel template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => downloadAuthenticated(projectsApi.EXPORT_PATH, 'projects.xlsx')}
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
          <Button size="sm" className="gap-2" onClick={() => navigate('/projects/new')}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search projects…"
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
        onRowClick={(row) => navigate(`/projects/${row.id}/edit`)}
        emptyTitle="No projects yet"
        emptyDescription="Create one to get started."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name || 'this project'}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteProject.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteProject.isPending}
      />
    </div>
  )
}
