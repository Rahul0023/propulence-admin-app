import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { messagingApi } from '@/services/messaging'
import type { MessageLogListParams, MessagingConsentListParams, MessagingConsentUpdate } from '@/types/messaging'

export function useMessageLogs(params: MessageLogListParams) {
  return useQuery({
    queryKey: ['message-logs', params],
    queryFn: () => messagingApi.listLogs(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useMessagingConsent(params: MessagingConsentListParams) {
  return useQuery({
    queryKey: ['messaging-consent', params],
    queryFn: () => messagingApi.listConsent(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useUpdateMessagingConsent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MessagingConsentUpdate }) =>
      messagingApi.updateConsent(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messaging-consent'] })
      toast.success('Consent updated')
    },
    onError: () => toast.error('Failed to update consent'),
  })
}
