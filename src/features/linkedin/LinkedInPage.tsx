import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import { RefreshCw, Unplug, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/data-table/DataTable'
import {
  useLinkedInAccount,
  useConnectLinkedIn,
  useDisconnectLinkedIn,
  useUpdateLinkedInAccount,
  useLinkedInShares,
  useRetryLinkedInShare,
} from '@/hooks/use-linkedin-admin'
import type { LinkedInShare } from '@/types/linkedin'

function AccountCard() {
  const { data: account, isLoading } = useLinkedInAccount()
  const connect = useConnectLinkedIn()
  const disconnect = useDisconnectLinkedIn()
  const updateAccount = useUpdateLinkedInAccount()
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading connection status…</p>

  const connected = !!account?.is_active && !!account?.has_access_token

  return (
    <Card>
      <CardHeader>
        <CardTitle>LinkedIn Company Page</CardTitle>
        <CardDescription>
          Published articles are shared automatically to this connected LinkedIn Organization Page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge active={connected} onLabel="Connected" offLabel="Not connected" />
              {account?.token_expiring_soon && <Badge variant="secondary">Access token expiring soon</Badge>}
              {account?.refresh_token_expiring_soon && <Badge variant="secondary">Refresh token expiring soon</Badge>}
            </div>
            {account?.organization_name && (
              <p className="text-sm text-muted-foreground">{account.organization_name} ({account.organization_urn})</p>
            )}
          </div>
          {connected ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setConfirmDisconnect(true)}>
              <Unplug className="h-4 w-4" /> Disconnect
            </Button>
          ) : (
            <Button size="sm" onClick={() => connect.mutate()} disabled={connect.isPending}>
              Connect with LinkedIn
            </Button>
          )}
        </div>

        {connected && (
          <>
            <div className="flex items-center gap-3">
              <Switch
                id="publishing-enabled"
                checked={account?.publishing_enabled}
                onCheckedChange={(checked) => account && updateAccount.mutate({ id: account.id, payload: { publishing_enabled: checked } })}
                disabled={updateAccount.isPending}
              />
              <Label htmlFor="publishing-enabled">Auto-share published articles to LinkedIn</Label>
            </div>
            {!account?.publishing_enabled && account?.refresh_token_expiring_soon && (
              <p className="text-sm text-amber-600">
                Auto-sharing is off and the refresh token is expiring soon — this may have been disabled
                automatically after a failed token refresh. Reconnect to resume auto-sharing.
              </p>
            )}
          </>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmDisconnect}
        onOpenChange={setConfirmDisconnect}
        title="Disconnect LinkedIn account?"
        description="Auto-sharing will stop immediately until reconnected."
        confirmLabel="Disconnect"
        onConfirm={() => disconnect.mutate(undefined, { onSuccess: () => setConfirmDisconnect(false) })}
        isLoading={disconnect.isPending}
      />
    </Card>
  )
}

const SHARES_PAGE_SIZE = 20

function SharesTable() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useLinkedInShares({ page, page_size: SHARES_PAGE_SIZE })
  const retry = useRetryLinkedInShare()

  const columns: ColumnDef<LinkedInShare, unknown>[] = [
    { accessorKey: 'post_id', header: 'Post' },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'published' ? 'success' : status === 'failed' ? 'destructive' : 'secondary'
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      id: 'link',
      header: 'LinkedIn Post',
      cell: ({ row }) =>
        row.original.permalink ? (
          <a
            href={row.original.permalink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary underline"
          >
            View <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          '—'
        ),
    },
    {
      id: 'error',
      header: 'Error',
      cell: ({ row }) => row.original.error_message || '—',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        row.original.status === 'failed' || row.original.status === 'skipped' ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Retry"
            onClick={(e) => {
              e.stopPropagation()
              retry.mutate(row.original.id)
            }}
            disabled={retry.isPending}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data?.results ?? []}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      page={page}
      pageSize={SHARES_PAGE_SIZE}
      totalCount={data?.count ?? 0}
      onPageChange={setPage}
      emptyTitle="No shares yet"
      emptyDescription="Publish an article to see it shared here automatically."
    />
  )
}

export function LinkedInPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const oauthStatus = searchParams.get('linkedin_oauth')
    if (!oauthStatus) return
    if (oauthStatus === 'connected') {
      toast.success('LinkedIn account connected')
    } else {
      toast.error(`LinkedIn connection failed (${searchParams.get('reason') || 'unknown error'})`)
    }
    searchParams.delete('linkedin_oauth')
    searchParams.delete('reason')
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">LinkedIn</h1>
        <p className="text-sm text-muted-foreground">Connect a Company Page and review auto-shared article history.</p>
      </div>

      <AccountCard />

      <Card>
        <CardHeader>
          <CardTitle>Share history</CardTitle>
        </CardHeader>
        <CardContent>
          <SharesTable />
        </CardContent>
      </Card>
    </div>
  )
}
