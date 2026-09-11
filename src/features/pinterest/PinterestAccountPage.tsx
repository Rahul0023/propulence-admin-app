import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Unplug, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  usePinterestAccount,
  useConnectPinterest,
  useDisconnectPinterestAccount,
  useUpdatePinterestAccount,
  usePinterestBoards,
  useCreatePinterestBoard,
  useSetDefaultPinterestBoard,
} from '@/hooks/use-pinterest'
import type { PinterestBoardPrivacy } from '@/types/pinterest'

const boardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  privacy: z.enum(['PUBLIC', 'SECRET']),
})

type BoardFormValues = z.infer<typeof boardSchema>

function CreateBoardDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createBoard = useCreatePinterestBoard()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: { name: '', description: '', privacy: 'PUBLIC' },
  })

  useEffect(() => {
    if (open) reset({ name: '', description: '', privacy: 'PUBLIC' })
  }, [open, reset])

  const onSubmit = (values: BoardFormValues) => {
    createBoard.mutate(
      { name: values.name, description: values.description || '', privacy: values.privacy },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">Name</Label>
            <Input id="board-name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-description">Description (optional)</Label>
            <Textarea id="board-description" rows={2} {...register('description')} />
          </div>

          <div className="space-y-2">
            <Label>Privacy</Label>
            <Controller
              control={control}
              name="privacy"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as PinterestBoardPrivacy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="SECRET">Secret</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBoard.isPending}>
              {createBoard.isPending ? 'Creating…' : 'Create board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AccountCard() {
  const { data: account, isLoading } = usePinterestAccount()
  const { data: boards } = usePinterestBoards()
  const connect = useConnectPinterest()
  const disconnect = useDisconnectPinterestAccount()
  const updateAccount = useUpdatePinterestAccount()
  const setDefaultBoard = useSetDefaultPinterestBoard()
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [createBoardOpen, setCreateBoardOpen] = useState(false)

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading connection status…</p>

  const connected = !!account?.is_active && account?.has_access_token

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pinterest Business Account</CardTitle>
          <CardDescription>
            Floor plans auto-publish as Pinterest Pins when connected. Manual video Pins can also be
            uploaded from the Pins page below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge active={connected} onLabel="Connected" offLabel="Not connected" />
                {account?.token_expiring_soon && <Badge variant="secondary">Access token expiring soon</Badge>}
              </div>
              {account?.username && <p className="text-sm text-muted-foreground">@{account.username}</p>}
            </div>
            {connected ? (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setConfirmDisconnect(true)}>
                <Unplug className="h-4 w-4" /> Disconnect
              </Button>
            ) : (
              <Button size="sm" onClick={() => connect.mutate()} disabled={connect.isPending}>
                Connect with Pinterest
              </Button>
            )}
          </div>

          {connected && (
            <div className="flex items-center gap-3">
              <Switch
                id="publishing-enabled"
                checked={account?.publishing_enabled}
                onCheckedChange={(checked) =>
                  account && updateAccount.mutate({ id: account.id, payload: { publishing_enabled: checked } })
                }
                disabled={updateAccount.isPending}
              />
              <Label htmlFor="publishing-enabled">Auto-publish floor plans to Pinterest</Label>
            </div>
          )}
        </CardContent>
      </Card>

      {connected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Boards</CardTitle>
              <CardDescription>The default board is used for every auto-published Pin.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setCreateBoardOpen(true)}>
              Create board
            </Button>
          </CardHeader>
          <CardContent>
            {!boards?.length ? (
              <EmptyState title="No boards yet" description="Boards sync automatically, or create one now." />
            ) : (
              <div className="space-y-2">
                {boards.map((board) => (
                  <div key={board.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{board.name}</p>
                      {board.description && (
                        <p className="text-xs text-muted-foreground">{board.description}</p>
                      )}
                    </div>
                    {board.is_default ? (
                      <Badge variant="success" className="gap-1">
                        <Star className="h-3 w-3" /> Default
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDefaultBoard.mutate(board.id)}
                        disabled={setDefaultBoard.isPending}
                      >
                        Set as default
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmDisconnect}
        onOpenChange={setConfirmDisconnect}
        title="Disconnect Pinterest account?"
        description="Auto-publishing will stop immediately until reconnected."
        confirmLabel="Disconnect"
        onConfirm={() => account && disconnect.mutate(account.id, { onSuccess: () => setConfirmDisconnect(false) })}
        isLoading={disconnect.isPending}
      />

      <CreateBoardDialog open={createBoardOpen} onOpenChange={setCreateBoardOpen} />
    </>
  )
}

export function PinterestAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const oauthStatus = searchParams.get('pinterest_oauth')
    if (!oauthStatus) return
    if (oauthStatus === 'connected') {
      toast.success('Pinterest account connected')
    } else {
      toast.error(`Pinterest connection failed (${searchParams.get('reason') || 'unknown error'})`)
    }
    searchParams.delete('pinterest_oauth')
    searchParams.delete('reason')
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Pinterest</h1>
        <p className="text-sm text-muted-foreground">Connect a Pinterest Business account and manage boards.</p>
      </div>

      <AccountCard />
    </div>
  )
}
