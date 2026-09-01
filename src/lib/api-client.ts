import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

// Dev: VITE_API_BASE_URL is empty → Vite proxy forwards /api → localhost:8000
// Prod: VITE_API_BASE_URL=https://api.propulence.com → browser calls API directly (CORS enabled)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

const STORAGE_KEY = 'propulence_admin_auth'

interface StoredAuth {
  access: string
  refresh: string
}

export const authStorage = {
  get(): StoredAuth | null {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as StoredAuth
    } catch {
      return null
    }
  },
  set(auth: StoredAuth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },
}

apiClient.interceptors.request.use((config) => {
  const auth = authStorage.get()
  if (auth?.access) {
    config.headers.Authorization = `Bearer ${auth.access}`
  }
  return config
})

// Real refresh path only — /api/accounts/accounts/token/refresh/ and
// /api/superadmin/token/refresh/ (both used by superadmin-propulence's Angular app) are
// confirmed dead routes, do not use either.
const REFRESH_URL = '/api/token/refresh/'

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const auth = authStorage.get()
  if (!auth?.refresh) throw new Error('No refresh token available')

  const { data } = await axios.post<{ access: string }>(
    `${import.meta.env.VITE_API_BASE_URL ?? ''}${REFRESH_URL}`,
    { refresh: auth.refresh },
  )
  authStorage.set({ ...auth, access: data.access })
  return data.access
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const access = await refreshPromise
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${access}`
        return apiClient(original)
      } catch {
        authStorage.clear()
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?return_url=${encodeURIComponent(window.location.pathname)}`
        }
      }
    }

    return Promise.reject(error)
  },
)
