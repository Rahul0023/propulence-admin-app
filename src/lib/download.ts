import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

/**
 * Every download/template/import endpoint requires the Bearer token this app uses for auth
 * (no cookie-based session — see CLAUDE.md's auth notes). A plain <a href> anchor never sends
 * that header and 401s. Fetch through the authenticated axios instance instead and trigger the
 * browser's save dialog from the resulting blob.
 */
export async function downloadAuthenticated(url: string, filename: string) {
  try {
    const response = await apiClient.get(url, { responseType: 'blob' })
    const blobUrl = window.URL.createObjectURL(response.data as Blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  } catch {
    toast.error('Download failed')
  }
}
