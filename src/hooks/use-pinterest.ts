import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pinterestApi } from '@/services/pinterest'
import { pinterestPinsApi, type PinterestVideoUploadPayload } from '@/services/pinterest-pins'
import type { PinterestAccount, PinterestBoardCreateRequest, PinterestPinListParams } from '@/types/pinterest'

function extractErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
  if (detail && typeof detail === 'object') {
    if (typeof detail.error === 'string') return detail.error
    if (typeof detail.detail === 'string') return detail.detail
    const firstFieldError = Object.values(detail).find((v) => Array.isArray(v) && v.length)
    if (Array.isArray(firstFieldError)) return String(firstFieldError[0])
  }
  return fallback
}

// ── Account ──────────────────────────────────────────────────────────────────

export function usePinterestAccount() {
  return useQuery({
    queryKey: ['pinterest-accounts'],
    queryFn: () => pinterestApi.listAccounts().then((r) => r.data.results[0] ?? null),
  })
}

export function useUpdatePinterestAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Partial<Pick<PinterestAccount, 'default_board_id' | 'publishing_enabled' | 'is_active'>>
    }) => pinterestApi.updateAccount(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-accounts'] })
      toast.success('Pinterest account updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update Pinterest account')),
  })
}

export function useDisconnectPinterestAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => pinterestApi.disconnectAccount(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-accounts'] })
      toast.success('Pinterest account disconnected')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to disconnect Pinterest account')),
  })
}

export function useConnectPinterest() {
  return useMutation({
    mutationFn: () => pinterestApi.oauthStart().then((r) => r.data.authorize_url),
    onSuccess: (authorizeUrl) => {
      window.location.href = authorizeUrl
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Could not start Pinterest connection')),
  })
}

// ── Boards ───────────────────────────────────────────────────────────────────

export function usePinterestBoards() {
  return useQuery({
    queryKey: ['pinterest-boards'],
    queryFn: () => pinterestApi.listBoards().then((r) => r.data.results),
  })
}

export function useCreatePinterestBoard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PinterestBoardCreateRequest) => pinterestApi.createBoard(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-boards'] })
      toast.success('Board created')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to create board')),
  })
}

export function useSetDefaultPinterestBoard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pinterestApi.setDefaultBoard(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-boards'] })
      qc.invalidateQueries({ queryKey: ['pinterest-accounts'] })
      toast.success('Default board updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to set default board')),
  })
}

// ── Pins ─────────────────────────────────────────────────────────────────────

export function usePinterestPins(params: PinterestPinListParams) {
  return useQuery({
    queryKey: ['pinterest-pins', params],
    queryFn: () => pinterestPinsApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useRetryPinterestPin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pinterestPinsApi.retry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-pins'] })
      toast.success('Pin queued for retry')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to retry pin')),
  })
}

export function useUnpublishPinterestPin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pinterestPinsApi.unpublish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-pins'] })
      toast.success('Pin unpublished')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to unpublish pin')),
  })
}

export function useRegeneratePinterestDescription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pinterestPinsApi.regenerateDescription(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-pins'] })
      toast.success('Description regenerated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to regenerate description')),
  })
}

export function useUpdatePinterestDescription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, description }: { id: number; description: string }) =>
      pinterestPinsApi.updateDescription(id, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-pins'] })
      toast.success('Description updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update description')),
  })
}

export function useUploadPinterestVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PinterestVideoUploadPayload) => pinterestPinsApi.uploadVideo(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinterest-pins'] })
      toast.success('Video queued for publishing')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to upload video')),
  })
}
