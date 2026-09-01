import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { notificationsApi } from '@/services/notifications'
import type {
  NotificationPreference,
  NotificationTemplateFormValues,
  NotificationCampaignFormValues,
  AINotificationRuleFormValues,
  SendNotificationValues,
} from '@/types/notification'

// ── Inbox ────────────────────────────────────────────────────────────────────

export function useNotificationsList(cursor?: string) {
  return useQuery({
    queryKey: ['notifications', 'list', cursor ?? null],
    queryFn: () => notificationsApi.list(cursor).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data.count),
    refetchInterval: 60_000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => notificationsApi.markRead(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useArchiveNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

// ── Preferences ──────────────────────────────────────────────────────────────

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => notificationsApi.getPreferences().then((r) => r.data),
  })
}

export function useUpdatePreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<NotificationPreference>) => notificationsApi.updatePreferences(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'preferences'] })
      toast.success('Preferences saved')
    },
    onError: () => toast.error('Failed to save preferences'),
  })
}

// ── Send ─────────────────────────────────────────────────────────────────────

export function useSendNotification() {
  return useMutation({
    mutationFn: (payload: SendNotificationValues) => notificationsApi.send(payload),
    onSuccess: (r) => toast.success(`Queued for ${r.data.queued} recipient(s)`),
    onError: () => toast.error('Failed to send notification'),
  })
}

// ── System analytics ─────────────────────────────────────────────────────────

export function useNotificationAnalytics() {
  return useQuery({
    queryKey: ['notifications', 'analytics'],
    queryFn: () => notificationsApi.analytics().then((r) => r.data),
  })
}

// ── Templates ────────────────────────────────────────────────────────────────

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ['notifications', 'templates'],
    queryFn: () => notificationsApi.listTemplates().then((r) => r.data),
    staleTime: 5 * 60_000, // reference data, invalidated explicitly on create/update/delete
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: NotificationTemplateFormValues) => notificationsApi.createTemplate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'templates'] })
      toast.success('Template created')
    },
    onError: () => toast.error('Failed to create template'),
  })
}

export function useUpdateTemplate(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<NotificationTemplateFormValues>) => notificationsApi.updateTemplate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'templates'] })
      toast.success('Template updated')
    },
    onError: () => toast.error('Failed to update template'),
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'templates'] })
      toast.success('Template deleted')
    },
  })
}

// ── Campaigns ────────────────────────────────────────────────────────────────

export function useNotificationCampaigns() {
  return useQuery({
    queryKey: ['notifications', 'campaigns'],
    queryFn: () => notificationsApi.listCampaigns().then((r) => r.data),
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<NotificationCampaignFormValues>) => notificationsApi.createCampaign(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'campaigns'] })
      toast.success('Campaign created')
    },
    onError: () => toast.error('Failed to create campaign'),
  })
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<NotificationCampaignFormValues>) => notificationsApi.updateCampaign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'campaigns'] })
      toast.success('Campaign updated')
    },
    onError: () => toast.error('Failed to update campaign'),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'campaigns'] })
      toast.success('Campaign deleted')
    },
  })
}

export function useLaunchCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.launchCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'campaigns'] })
      toast.success('Campaign launched')
    },
    onError: () => toast.error('Failed to launch campaign'),
  })
}

// ── AI Rules ─────────────────────────────────────────────────────────────────

export function useAiRules() {
  return useQuery({
    queryKey: ['notifications', 'ai-rules'],
    queryFn: () => notificationsApi.listAiRules().then((r) => r.data),
    staleTime: 5 * 60_000, // reference data, invalidated explicitly on create/update/delete
  })
}

export function useCreateAiRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AINotificationRuleFormValues) => notificationsApi.createAiRule(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'ai-rules'] })
      toast.success('AI rule created')
    },
    onError: () => toast.error('Failed to create AI rule'),
  })
}

export function useUpdateAiRule(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<AINotificationRuleFormValues>) => notificationsApi.updateAiRule(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'ai-rules'] })
      toast.success('AI rule updated')
    },
    onError: () => toast.error('Failed to update AI rule'),
  })
}

export function useDeleteAiRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.deleteAiRule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'ai-rules'] })
      toast.success('AI rule deleted')
    },
  })
}
