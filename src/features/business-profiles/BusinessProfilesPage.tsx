import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Users, QrCode, Calendar, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatCard } from '@/components/StatCard'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import { useBusinessProfiles, useDeleteBusinessProfile, useBusinessProfileStats } from '@/hooks/use-business-profiles'
import type { BusinessProfileListItem } from '@/types/business-profile'

const PAGE_SIZE = 20

export function BusinessProfilesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<BusinessProfileListItem | null>(null)

  const { data, isLoading, isError, refetch } = useBusinessProfiles({ page, page_size: PAGE_SIZE, search })
  const { data: stats, isLoading: statsLoading } = useBusinessProfileStats()
  const deleteProfile = useDeleteBusinessProfile()

  const columns: ColumnDef<BusinessProfileListItem, unknown>[] = [
    {
      id: 'name',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.photo_url ?? undefined} alt={row.original.full_name} />
            <AvatarFallback>{row.original.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium leading-tight">{row.original.full_name}</p>
            <p className="text-xs text-muted-foreground">{row.original.designation || '—'}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'company_name', header: 'Company', cell: ({ row }) => row.original.company_name || '—' },
    {
      id: 'contact',
      header: 'Contact info',
      cell: ({ row }) => (
        <div className="text-xs">
          <p>{row.original.phone || '—'}</p>
          <p className="text-muted-foreground">{row.original.email || '—'}</p>
        </div>
      ),
    },
    { accessorKey: 'city', header: 'City', cell: ({ row }) => row.original.city || '—' },
    {
      id: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <Badge variant={row.original.source === 'SCANNED' ? 'secondary' : 'outline'}>{row.original.source}</Badge>
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
          <h1 className="font-serif text-2xl font-semibold">Business Profiles</h1>
          <p className="text-sm text-muted-foreground">
            Digital business cards with auto-generated QR/vCard — BusinessProfileViewSet.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => navigate('/business-profiles/new')}>
          <Plus className="h-4 w-4" /> New Profile
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats?.total ?? 0} icon={Users} isLoading={statsLoading} />
        <StatCard label="Added this month" value={stats?.added_this_month ?? 0} icon={Calendar} isLoading={statsLoading} />
        <StatCard label="QR generated" value={stats?.qr_generated ?? 0} icon={QrCode} isLoading={statsLoading} />
        <StatCard label="Scanned source" value={stats?.scanned ?? 0} icon={ScanLine} isLoading={statsLoading} />
      </div>

      <Input
        placeholder="Search by name, company, email, phone, city…"
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
        onRowClick={(row) => navigate(`/business-profiles/${row.id}/edit`)}
        emptyTitle="No business profiles yet"
        emptyDescription="Create one to get started."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.full_name || 'this profile'}"?`}
        description="This cannot be undone."
        onConfirm={() => {
          if (deleteTarget) deleteProfile.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
        isLoading={deleteProfile.isPending}
      />
    </div>
  )
}
