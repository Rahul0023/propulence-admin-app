import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/data-table/DataTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { RejectApplicationDialog } from '@/features/agent-applications/RejectApplicationDialog'
import { useAgentApplications, useDecideAgentApplication } from '@/hooks/use-agent-applications'
import type { AgentApplication, AgentApplicationStatus } from '@/types/agent-applications'

const PAGE_SIZE = 20

const STATUS_VARIANT: Record<AgentApplicationStatus, 'success' | 'destructive' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
}

export function AgentApplicationsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<AgentApplicationStatus | 'ALL'>('ALL')
  const [approveTarget, setApproveTarget] = useState<AgentApplication | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AgentApplication | null>(null)

  const { data, isLoading, isError, refetch } = useAgentApplications({
    page,
    page_size: PAGE_SIZE,
    status: status === 'ALL' ? undefined : status,
  })
  const decideApplication = useDecideAgentApplication()

  const columns: ColumnDef<AgentApplication, unknown>[] = [
    {
      id: 'applicant',
      header: 'Applicant',
      cell: ({ row }) => (
        <div>
          <div>{row.original.full_name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    { accessorKey: 'profession_title', header: 'Title', cell: ({ row }) => row.original.profession_title || '—' },
    { accessorKey: 'agency_name', header: 'Agency', cell: ({ row }) => row.original.agency_name || '—' },
    { accessorKey: 'license_number', header: 'License #', cell: ({ row }) => row.original.license_number || '—' },
    { accessorKey: 'operating_city', header: 'City', cell: ({ row }) => row.original.operating_city || '—' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'created_at',
      header: 'Applied',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('en-IN'),
    },
    {
      id: 'reviewed',
      header: 'Reviewed',
      cell: ({ row }) =>
        row.original.reviewed_by_name ? (
          <div className="text-xs">
            <div>{row.original.reviewed_by_name}</div>
            <div className="text-muted-foreground">
              {row.original.reviewed_at ? new Date(row.original.reviewed_at).toLocaleDateString('en-IN') : '—'}
            </div>
          </div>
        ) : (
          '—'
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        row.original.status === 'PENDING' ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Approve"
              onClick={(e) => {
                e.stopPropagation()
                setApproveTarget(row.original)
              }}
            >
              <Check className="h-4 w-4 text-success" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reject"
              onClick={(e) => {
                e.stopPropagation()
                setRejectTarget(row.original)
              }}
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Agent Applications</h1>
        <p className="text-sm text-muted-foreground">
          Review real-estate agent onboarding requests. Note: self-service applications currently
          auto-approve on submission, so most rows may already be Approved — Pending only occurs
          via other application paths.
        </p>
      </div>

      <Select
        value={status}
        onValueChange={(v) => {
          setStatus(v as AgentApplicationStatus | 'ALL')
          setPage(1)
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
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
        emptyTitle="No applications"
        emptyDescription="Agent applications will show up here as they're submitted."
      />

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title={`Approve "${approveTarget?.full_name || 'this application'}"?`}
        description="This activates their Agent profile and grants the Agent role."
        confirmLabel="Approve"
        destructive={false}
        isLoading={decideApplication.isPending}
        onConfirm={() => {
          if (approveTarget) {
            decideApplication.mutate(
              { id: approveTarget.id, decision: 'approve', adminNote: '' },
              { onSuccess: () => setApproveTarget(null) },
            )
          }
        }}
      />

      <RejectApplicationDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        application={rejectTarget}
        isLoading={decideApplication.isPending}
        onConfirm={(adminNote) => {
          if (rejectTarget) {
            decideApplication.mutate(
              { id: rejectTarget.id, decision: 'reject', adminNote },
              { onSuccess: () => setRejectTarget(null) },
            )
          }
        }}
      />
    </div>
  )
}
