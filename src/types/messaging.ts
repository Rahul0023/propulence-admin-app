export type MessageChannel = 'SMS' | 'WHATSAPP'

export type MessageStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'SKIPPED_CONSENT' | 'SKIPPED_DND'

export type MessageEventType =
  | 'WELCOME_LOGIN'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'TEAM_INVITE'
  | 'TEAM_REMINDER'
  | 'PROMOTIONAL'

export type MessageCategory = 'TRANSACTIONAL' | 'PROMOTIONAL'

export interface MessageLog {
  id: string
  phone: string
  channel: MessageChannel
  event_type: MessageEventType
  category: MessageCategory
  status: MessageStatus
  provider: string
  provider_message_id: string
  template_id: string
  error_message: string
  attempt: number
  related_object_repr: string | null
  created_at: string
  sent_at: string | null
}

export interface MessageLogListParams {
  page?: number
  page_size?: number
  search?: string
  channel?: MessageChannel
  event_type?: MessageEventType
  status?: MessageStatus
}

export interface MessagingConsent {
  id: number
  phone: string
  user: number | null
  sms_transactional_opt_in: boolean
  sms_promotional_opt_in: boolean
  whatsapp_opt_in: boolean
  whatsapp_marketing_opt_in: boolean
  dnd_registered: boolean
  opted_out_at: string | null
  source: string
  created_at: string
  updated_at: string
}

export interface MessagingConsentListParams {
  page?: number
  page_size?: number
  search?: string
}

export type MessagingConsentUpdate = Partial<
  Pick<
    MessagingConsent,
    'sms_transactional_opt_in' | 'sms_promotional_opt_in' | 'whatsapp_opt_in' | 'whatsapp_marketing_opt_in' | 'dnd_registered'
  >
>
