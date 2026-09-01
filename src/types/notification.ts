/**
 * Real shapes from apps/notifications/serializers.py — verified against source before writing
 * any of this (see notes inline for endpoint-specific quirks).
 */
export const NOTIFICATION_CATEGORIES = ['TRANSACTIONAL', 'MARKETING', 'ENGAGEMENT', 'SYSTEM', 'GENERAL'] as const
export const NOTIFICATION_PRIORITIES = ['HIGH', 'NORMAL', 'LOW'] as const
export const CAMPAIGN_STATUSES = ['DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED'] as const
export const AI_RULE_TYPES = ['PROPERTY_VIEW_COUNT', 'INACTIVITY', 'PRICE_DROP', 'SAVED_SEARCH_MATCH'] as const

export interface Notification {
  id: string
  title: string
  body: string
  category: (typeof NOTIFICATION_CATEGORIES)[number]
  notification_type: string
  priority: (typeof NOTIFICATION_PRIORITIES)[number]
  image_url: string | null
  action_url: string | null
  deep_link: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  is_archived: boolean
  delivered: boolean
  clicked: boolean
  scheduled_at: string | null
  delivered_at: string | null
  read_at: string | null
  clicked_at: string | null
  created_at: string
}

export interface NotificationPreference {
  enable_push: boolean
  enable_marketing: boolean
  enable_transactional: boolean
  enable_news: boolean
  enable_price_alerts: boolean
  enable_site_visit_alerts: boolean
  enable_project_updates: boolean
  enable_lead_alerts: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  timezone: string
}

export interface NotificationTemplate {
  id: number
  name: string
  notification_type: string
  category: (typeof NOTIFICATION_CATEGORIES)[number]
  title_template: string
  body_template: string
  image_url: string | null
  action_url: string | null
  deep_link_template: string | null
  priority: (typeof NOTIFICATION_PRIORITIES)[number]
  is_active: boolean
}

export type NotificationTemplateFormValues = Omit<NotificationTemplate, 'id'>

export interface NotificationCampaign {
  id: string
  name: string
  title: string
  body: string
  image_url: string | null
  action_url: string | null
  deep_link: string | null
  audience_filters: Record<string, unknown>
  ab_variant: string | null
  status: (typeof CAMPAIGN_STATUSES)[number]
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  total_recipients: number
  sent_count: number
  delivered_count: number
  clicked_count: number
  created_at: string
}

export type NotificationCampaignFormValues = Pick<
  NotificationCampaign,
  'name' | 'title' | 'body' | 'image_url' | 'action_url' | 'deep_link' | 'scheduled_at'
>

export interface AINotificationRule {
  id: number
  name: string
  rule_type: (typeof AI_RULE_TYPES)[number]
  conditions: Record<string, unknown>
  template: number
  is_active: boolean
  cooldown_hours: number
  created_at: string
}

export type AINotificationRuleFormValues = Omit<AINotificationRule, 'id' | 'created_at'>

/** POST /api/notifications/send/ payload — SendNotificationSerializer. */
export interface SendNotificationValues {
  user_ids?: number[]
  emails?: string[]
  phones?: string[]
  role?: string
  notification_type: string
  title: string
  body: string
  category: 'TRANSACTIONAL' | 'MARKETING' | 'ENGAGEMENT' | 'SYSTEM'
  priority?: 'HIGH' | 'NORMAL' | 'LOW'
}

/** GET /api/notifications/analytics/ — NotificationAnalyticsView, system-wide (admin only). */
export interface NotificationAnalytics {
  period_days: number
  total: number
  delivered: number
  read: number
  clicked: number
  delivery_rate: number
  open_rate: number
  click_through_rate: number
  by_category: { category: string; count: number }[]
}

/** ws/notifications/?token=<jwt> — payload shape from notification_service.py:222-234. */
export interface WsNotificationPayload {
  id: string
  type: 'notification.new'
  title: string
  body: string
  category: string
  notification_type: string
  priority: string
  image_url: string
  action_url: string
  deep_link: string
  created_at: string
}

export interface WsUnreadCountPayload {
  type: 'unread_count'
  count: number
}
