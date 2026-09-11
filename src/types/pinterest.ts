/**
 * Ported from crm-propulence/src/app/models/pinterest.model.ts — see
 * propulence-backend/apps/pinterest/{models,serializers}.py for the source of truth.
 */

// ── Core enums ────────────────────────────────────────────────────────────────

export type PinterestPinStatus = 'draft' | 'publishing' | 'published' | 'failed' | 'unpublished'
export type PinterestPinSourceType = 'floor_plan' | 'manual_video'
export type PinterestPinMediaType = 'image' | 'video'
export type PinterestBoardPrivacy = 'PUBLIC' | 'SECRET'

// ── Account (settings) ───────────────────────────────────────────────────────

export interface PinterestAccount {
  id: number
  pinterest_user_id: string
  username: string
  has_access_token: boolean
  has_refresh_token: boolean
  default_board_id: string
  publishing_enabled: boolean
  is_active: boolean
  token_expires_at: string | null
  token_expiring_soon: boolean
  created_at: string
  updated_at: string
}

// ── Boards ────────────────────────────────────────────────────────────────────

export interface PinterestBoard {
  id: number
  account: number
  board_id: string
  name: string
  description: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

export interface PinterestOAuthStartResponse {
  authorize_url: string
}

// ── Board creation ────────────────────────────────────────────────────────────

export interface PinterestBoardCreateRequest {
  name: string
  description?: string
  privacy?: PinterestBoardPrivacy
}

// ── Manual video upload ──────────────────────────────────────────────────────

export interface PinterestVideoUploadResponse {
  status: string
  task_id: string
  pin: PinterestPin
}

// ── Pins ──────────────────────────────────────────────────────────────────────

export interface PinterestPin {
  id: number
  source_type: PinterestPinSourceType
  media_type: PinterestPinMediaType
  floor_plan_id: number | null
  project_id: number | null
  board_id: string
  title: string
  description: string
  description_is_custom: boolean
  link: string
  image_url: string
  video_file: string | null
  cover_image: string | null
  cover_image_url: string
  pinterest_media_id: string
  status: PinterestPinStatus
  pin_id: string
  permalink: string
  error_code: string
  error_message: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PinterestPinListParams {
  project_id?: number
  status?: PinterestPinStatus
  page?: number
  page_size?: number
}
