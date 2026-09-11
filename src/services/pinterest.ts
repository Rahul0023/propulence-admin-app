import { apiClient } from '@/lib/api-client'
import type {
  PinterestAccount,
  PinterestBoard,
  PinterestBoardCreateRequest,
  PinterestOAuthStartResponse,
} from '@/types/pinterest'

const OAUTH_BASE = '/api/pinterest/'
const ACCOUNTS_BASE = '/api/pinterest/crm/accounts/'
const BOARDS_BASE = '/api/pinterest/crm/boards/'

export const pinterestApi = {
  // ── OAuth ──────────────────────────────────────────────────────────────────
  oauthStart() {
    return apiClient.get<PinterestOAuthStartResponse>(`${OAUTH_BASE}oauth/start/`)
  },

  // ── Account (singleton — treat the list as "the first item or none") ───────
  listAccounts() {
    return apiClient.get<PinterestAccount[]>(ACCOUNTS_BASE)
  },
  updateAccount(
    id: number,
    payload: Partial<Pick<PinterestAccount, 'default_board_id' | 'publishing_enabled' | 'is_active'>>,
  ) {
    return apiClient.patch<PinterestAccount>(`${ACCOUNTS_BASE}${id}/`, payload)
  },
  disconnectAccount(id: number) {
    return apiClient.post<PinterestAccount>(`${ACCOUNTS_BASE}${id}/disconnect/`)
  },

  // ── Boards ───────────────────────────────────────────────────────────────────
  listBoards() {
    return apiClient.get<PinterestBoard[]>(BOARDS_BASE)
  },
  createBoard(payload: PinterestBoardCreateRequest) {
    return apiClient.post<PinterestBoard>(BOARDS_BASE, payload)
  },
  setDefaultBoard(id: number) {
    return apiClient.post<PinterestBoard>(`${BOARDS_BASE}${id}/set-default/`)
  },
}
