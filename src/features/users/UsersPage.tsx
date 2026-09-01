import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import { useStaffList, useDeleteStaff, useStaffActions } from '@/hooks/use-staff'
import { StaffFormDialog } from '@/features/users/StaffFormDialog'
import type { StaffUser } from '@/types/staff'

const PAGE_SIZE = 20

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editTarget, setEditTarget] = useState<StaffUser | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null)

  const { data, isLoading, isError, refetch } = useStaffList({ page, page_size: PAGE_SIZE, search })
  const deleteStaff = useDeleteStaff()

  const columns: ColumnDef<StaffUser, unknown>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge> },
    {
      id: 'access_levels',
      header: 'Access levels',
      cell: ({ row }) =>
        row.original.access_levels.length ? (
          <div className="flex flex-wrap gap-1">
            {row.original.access_levels.map((a) => (
              <Badge key={a.id} variant="secondary">
                {a.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <ActiveToggleCell user={row.original} />,
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
          <h1 className="font-serif text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            StaffViewSet — admin/staff/agent accounts (buyers/tenants excluded by default). Not the
            Django Groups/Permissions editor — that data isn't consumed by any real authorization check.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setEditTarget(null)}>
          <Plus className="h-4 w-4" /> New User
        </Button>
      </div>

      <Input
        placeholder="Search by name or email…"
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
        onRowClick={(row) => setEditTarget(row)}
        emptyTitle="No users yet"
      />

      <StaffFormDialog open={editTarget !== undefined} onOpenChange={(open) => !open && setEditTarget(undefined)} staff={editTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.full_name || 'this user'}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteStaff.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteStaff.isPending}
      />
    </div>
  )
}

function ActiveToggleCell({ user }: { user: StaffUser }) {
  const { activate, deactivate } = useStaffActions(user.id)
  const isPending = activate.isPending || deactivate.isPending

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation()
        if (user.is_active) deactivate.mutate()
        else activate.mutate()
      }}
    >
      <StatusBadge active={user.is_active} onLabel="Active" offLabel="Inactive" />
    </button>
  )
}
