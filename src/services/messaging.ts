import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
import type {
  MessageLog,
  MessageLogListParams,
  MessagingConsent,
  MessagingConsentListParams,
  MessagingConsentUpdate,
} from '@/types/messaging'

const LOGS_BASE = '/api/messaging/logs/'
const CONSENT_BASE = '/api/messaging/consent/'

export const messagingApi = {
  listLogs(params: MessageLogListParams = {}) {
    return apiClient.get<PaginatedResponse<MessageLog>>(LOGS_BASE, { params })
  },
  listConsent(params: MessagingConsentListParams = {}) {
    return apiClient.get<PaginatedResponse<MessagingConsent>>(CONSENT_BASE, { params })
  },
  updateConsent(id: number, payload: MessagingConsentUpdate) {
    return apiClient.patch<MessagingConsent>(`${CONSENT_BASE}${id}/`, payload)
  },
}
