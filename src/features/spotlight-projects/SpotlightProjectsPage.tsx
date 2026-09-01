import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import { useSpotlightProjects, useDeleteSpotlightProject } from '@/hooks/use-spotlight-projects'
import type { SpotliteProject } from '@/types/spotlight-project'

const PAGE_SIZE = 20

export function SpotlightProjectsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SpotliteProject | null>(null)

  const { data, isLoading, isError, refetch } = useSpotlightProjects({ page, page_size: PAGE_SIZE, search })
  const deleteSpotlightProject = useDeleteSpotlightProject()

  const columns: ColumnDef<SpotliteProject, unknown>[] = [
    {
      id: 'project',
      header: 'Project',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title || row.original.project_name}</div>
          {row.original.title && <div className="text-xs text-muted-foreground">{row.original.project_name}</div>}
        </div>
      ),
    },
    { accessorKey: 'sort_order', header: 'Sort order' },
    {
      id: 'week',
      header: 'Week window',
      cell: ({ row }) =>
        row.original.week_start && row.original.week_end
          ? `${row.original.week_start} – ${row.original.week_end}`
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
          <h1 className="font-serif text-2xl font-semibold">Spotlight Projects</h1>
          <p className="text-sm text-muted-foreground">
            Curated projects for the public home page's "promoted" rotator. At most 5 active rows may
            overlap any given week window — the backend rejects anything beyond that.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => navigate('/spotlight-projects/new')}>
          <Plus className="h-4 w-4" /> New Spotlight Project
        </Button>
      </div>

      <Input
        placeholder="Search by project name…"
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
        onRowClick={(row) => navigate(`/spotlight-projects/${row.id}/edit`)}
        emptyTitle="No spotlight projects yet"
        emptyDescription="Add one to feature it in the home page's promoted rotator."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Remove "${deleteTarget?.title || deleteTarget?.project_name || 'this spotlight project'}"?`}
        description="This only removes it from the promoted rotator — the underlying project is untouched."
        onConfirm={() => {
          if (deleteTarget) deleteSpotlightProject.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteSpotlightProject.isPending}
      />
    </div>
  )
}
