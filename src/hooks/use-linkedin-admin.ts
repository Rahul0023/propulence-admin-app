import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { linkedInAccountApi, linkedInOAuthApi, linkedInSharesApi } from '@/services/linkedin-admin'
import type { LinkedInAccount, LinkedInShareListParams } from '@/types/linkedin'

function extractErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
  if (detail && typeof detail === 'object') {
    const nonField = detail.non_field_errors ?? detail.error
    if (Array.isArray(nonField) && nonField.length) return String(nonField[0])
    if (typeof nonField === 'string') return nonField
    const firstFieldError = Object.values(detail).find((v) => Array.isArray(v) && v.length)
    if (Array.isArray(firstFieldError)) return String(firstFieldError[0])
  }
  return fallback
}

export function useLinkedInAccount() {
  return useQuery({
    queryKey: ['linkedin-account'],
    queryFn: () => linkedInAccountApi.get().then((r) => r.data.results[0] ?? null),
  })
}

export function useConnectLinkedIn() {
  return useMutation({
    mutationFn: () => linkedInOAuthApi.start().then((r) => r.data.authorize_url),
    onSuccess: (authorizeUrl) => {
      window.location.href = authorizeUrl
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to start LinkedIn connection')),
  })
}

export function useDisconnectLinkedIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => linkedInAccountApi.disconnect(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['linkedin-account'] })
      toast.success('LinkedIn account disconnected')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to disconnect LinkedIn account')),
  })
}

export function useUpdateLinkedInAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Pick<LinkedInAccount, 'organization_urn' | 'publishing_enabled'>> }) =>
      linkedInAccountApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['linkedin-account'] })
      toast.success('LinkedIn settings updated')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update LinkedIn settings')),
  })
}

export function useLinkedInShares(params: LinkedInShareListParams = {}) {
  return useQuery({
    queryKey: ['linkedin-shares', params],
    queryFn: () => linkedInSharesApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useRetryLinkedInShare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => linkedInSharesApi.retry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['linkedin-shares'] })
      toast.success('Retry queued')
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to retry share')),
  })
}
