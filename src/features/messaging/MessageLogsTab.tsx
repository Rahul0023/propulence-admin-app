import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/data-table/DataTable'
import { useMessageLogs } from '@/hooks/use-messaging'
import type { MessageChannel, MessageEventType, MessageLog, MessageStatus } from '@/types/messaging'

const PAGE_SIZE = 20

const STATUS_VARIANT: Record<MessageStatus, 'success' | 'destructive' | 'secondary' | 'warning'> = {
  SENT: 'success',
  FAILED: 'destructive',
  QUEUED: 'warning',
  SKIPPED_CONSENT: 'secondary',
  SKIPPED_DND: 'secondary',
}

const EVENT_TYPE_LABEL: Record<MessageEventType, string> = {
  WELCOME_LOGIN: 'Welcome (First Login)',
  LISTING_APPROVED: 'Listing Approved',
  LISTING_REJECTED: 'Listing Rejected',
  TEAM_INVITE: 'Team Invite',
  TEAM_REMINDER: 'Team Reminder',
  PROMOTIONAL: 'Promotional',
}

export function MessageLogsTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState<MessageChannel | 'ALL'>('ALL')
  const [status, setStatus] = useState<MessageStatus | 'ALL'>('ALL')

  const { data, isLoading, isError, refetch } = useMessageLogs({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
    channel: channel === 'ALL' ? undefined : channel,
    status: status === 'ALL' ? undefined : status,
  })

  const columns: ColumnDef<MessageLog, unknown>[] = [
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'channel',
      header: 'Channel',
      cell: ({ row }) => <Badge variant="outline">{row.original.channel}</Badge>,
    },
    {
      accessorKey: 'event_type',
      header: 'Event',
      cell: ({ row }) => EVENT_TYPE_LABEL[row.original.event_type] ?? row.original.event_type,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>,
    },
    { accessorKey: 'provider', header: 'Provider', cell: ({ row }) => row.original.provider || '—' },
    {
      id: 'error',
      header: 'Error',
      cell: ({ row }) =>
        row.original.error_message ? (
          <span className="text-xs text-destructive" title={row.original.error_message}>
            {row.original.error_message.length > 40
              ? `${row.original.error_message.slice(0, 40)}…`
              : row.original.error_message}
          </span>
        ) : (
          '—'
        ),
    },
    {
      accessorKey: 'created_at',
      header: 'Sent',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString('en-IN'),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by phone or message ID…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs"
        />
        <Select
          value={channel}
          onValueChange={(v) => {
            setChannel(v as MessageChannel | 'ALL')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All channels</SelectItem>
            <SelectItem value="SMS">SMS</SelectItem>
            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as MessageStatus | 'ALL')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="QUEUED">Queued</SelectItem>
            <SelectItem value="SKIPPED_CONSENT">Skipped — No Consent</SelectItem>
            <SelectItem value="SKIPPED_DND">Skipped — DND</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
        emptyTitle="No messages yet"
        emptyDescription="SMS/WhatsApp sends from apps.messaging will show up here."
      />
    </div>
  )
}
