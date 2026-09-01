import { apiClient } from '@/lib/api-client'
import type { CursorPaginatedResponse, PaginatedResponse } from '@/types/api'
import type {
  Notification,
  NotificationPreference,
  NotificationTemplate,
  NotificationTemplateFormValues,
  NotificationCampaign,
  NotificationCampaignFormValues,
  AINotificationRule,
  AINotificationRuleFormValues,
  SendNotificationValues,
  NotificationAnalytics,
} from '@/types/notification'

const BASE = '/api/notifications/'

export const notificationsApi = {
  // NotificationViewSet uses CursorPagination (page_size=20, ordering=-created_at) — no `count`
  // field, unlike the PageNumberPagination-backed lists elsewhere in this app.
  list(cursor?: string) {
    return apiClient.get<CursorPaginatedResponse<Notification>>(BASE, { params: cursor ? { cursor } : {} })
  },
  unreadCount() {
    return apiClient.get<{ count: number }>(`${BASE}unread-count/`)
  },
  markRead(ids: string[]) {
    return apiClient.post<{ updated: number }>(`${BASE}mark-read/`, { ids })
  },
  markAllRead() {
    return apiClient.post<{ updated: number }>(`${BASE}mark-all-read/`)
  },
  archive(id: string) {
    return apiClient.post<{ archived: boolean }>(`${BASE}${id}/archive/`)
  },
  remove(id: string) {
    return apiClient.delete(`${BASE}${id}/`)
  },

  getPreferences() {
    return apiClient.get<NotificationPreference>(`${BASE}preferences/`)
  },
  updatePreferences(payload: Partial<NotificationPreference>) {
    return apiClient.put<NotificationPreference>(`${BASE}preferences/`, payload)
  },

  send(payload: SendNotificationValues) {
    return apiClient.post<{ queued: number }>(`${BASE}send/`, payload)
  },

  analytics() {
    return apiClient.get<NotificationAnalytics>(`${BASE}analytics/`)
  },

  // Templates/campaigns/ai-rules don't override pagination_class → inherit the global
  // PageNumberPagination default (count/next/previous/results).
  listTemplates() {
    return apiClient.get<PaginatedResponse<NotificationTemplate>>(`${BASE}templates/`)
  },
  createTemplate(payload: NotificationTemplateFormValues) {
    return apiClient.post<NotificationTemplate>(`${BASE}templates/`, payload)
  },
  updateTemplate(id: number, payload: Partial<NotificationTemplateFormValues>) {
    return apiClient.patch<NotificationTemplate>(`${BASE}templates/${id}/`, payload)
  },
  deleteTemplate(id: number) {
    return apiClient.delete(`${BASE}templates/${id}/`)
  },

  listCampaigns() {
    return apiClient.get<PaginatedResponse<NotificationCampaign>>(`${BASE}campaigns/`)
  },
  createCampaign(payload: Partial<NotificationCampaignFormValues>) {
    return apiClient.post<NotificationCampaign>(`${BASE}campaigns/`, payload)
  },
  updateCampaign(id: string, payload: Partial<NotificationCampaignFormValues>) {
    return apiClient.patch<NotificationCampaign>(`${BASE}campaigns/${id}/`, payload)
  },
  deleteCampaign(id: string) {
    return apiClient.delete(`${BASE}campaigns/${id}/`)
  },
  launchCampaign(id: string) {
    return apiClient.post<{ launched: boolean }>(`${BASE}campaigns/${id}/launch/`)
  },

  listAiRules() {
    return apiClient.get<PaginatedResponse<AINotificationRule>>(`${BASE}ai-rules/`)
  },
  createAiRule(payload: AINotificationRuleFormValues) {
    return apiClient.post<AINotificationRule>(`${BASE}ai-rules/`, payload)
  },
  updateAiRule(id: number, payload: Partial<AINotificationRuleFormValues>) {
    return apiClient.patch<AINotificationRule>(`${BASE}ai-rules/${id}/`, payload)
  },
  deleteAiRule(id: number) {
    return apiClient.delete(`${BASE}ai-rules/${id}/`)
  },
}
