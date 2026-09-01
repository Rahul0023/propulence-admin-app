import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/DataTable'
import { useMessagingConsent, useUpdateMessagingConsent } from '@/hooks/use-messaging'
import type { MessagingConsent, MessagingConsentUpdate } from '@/types/messaging'

const PAGE_SIZE = 20

export function MessagingConsentTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch } = useMessagingConsent({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
  })
  const updateConsent = useUpdateMessagingConsent()

  const toggle = (row: MessagingConsent, field: keyof MessagingConsentUpdate) => {
    updateConsent.mutate({ id: row.id, payload: { [field]: !row[field] } })
  }

  const columns: ColumnDef<MessagingConsent, unknown>[] = [
    { accessorKey: 'phone', header: 'Phone' },
    {
      id: 'sms_transactional',
      header: 'SMS Transactional',
      cell: ({ row }) => (
        <Switch
          checked={row.original.sms_transactional_opt_in}
          onCheckedChange={() => toggle(row.original, 'sms_transactional_opt_in')}
        />
      ),
    },
    {
      id: 'sms_promotional',
      header: 'SMS Promotional',
      cell: ({ row }) => (
        <Switch
          checked={row.original.sms_promotional_opt_in}
          onCheckedChange={() => toggle(row.original, 'sms_promotional_opt_in')}
        />
      ),
    },
    {
      id: 'whatsapp',
      header: 'WhatsApp',
      cell: ({ row }) => (
        <Switch checked={row.original.whatsapp_opt_in} onCheckedChange={() => toggle(row.original, 'whatsapp_opt_in')} />
      ),
    },
    {
      id: 'whatsapp_marketing',
      header: 'WhatsApp Marketing',
      cell: ({ row }) => (
        <Switch
          checked={row.original.whatsapp_marketing_opt_in}
          onCheckedChange={() => toggle(row.original, 'whatsapp_marketing_opt_in')}
        />
      ),
    },
    {
      id: 'dnd',
      header: 'DND',
      cell: ({ row }) =>
        row.original.dnd_registered ? <Badge variant="warning">DND Registered</Badge> : <span className="text-muted-foreground">—</span>,
    },
    { accessorKey: 'source', header: 'Source' },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => new Date(row.original.updated_at).toLocaleString('en-IN'),
    },
  ]

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by phone…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="max-w-xs"
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
        emptyTitle="No consent records yet"
        emptyDescription="A row is created automatically the first time apps.messaging sends to a phone number."
      />
    </div>
  )
}
