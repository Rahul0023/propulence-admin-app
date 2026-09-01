import { apiClient } from '@/lib/api-client'
import type { LoginResponse, MeResponse } from '@/types/auth'

export const authApi = {
  // POST /api/auth/superadmin/login/ (SuperAdminLoginView, apps/accounts/views.py:116-155).
  // Requires backend is_superuser=True. SuperAdminTokenObtainPairSerializer.validate()
  // (views.py:101-105) raises a bare `raise Exception(...)` for the non-superuser case, not a
  // DRF ValidationError, and no custom DRF EXCEPTION_HANDLER is configured (confirmed commented
  // out in settings/base.py:383) — so this actually surfaces as an unhandled 500, not the clean
  // 400 "Only SuperAdmin can login here." the OpenAPI docstring claims. The login form's error
  // fallback message covers this; don't assume `response.data.detail` is populated here.
  login(email: string, password: string) {
    return apiClient.post<LoginResponse>('/api/auth/superadmin/login/', { email, password })
  },

  // MeSerializer — deliberately narrower than the login response, see MeResponse's doc comment.
  me() {
    return apiClient.get<MeResponse>('/api/auth/me/')
  },

  logout(refresh: string) {
    return apiClient.post('/api/auth/auth/logout/', { refresh })
  },

  logoutAll() {
    return apiClient.post('/api/auth/auth/logout-all/')
  },
}
