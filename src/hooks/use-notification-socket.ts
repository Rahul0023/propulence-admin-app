import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authStorage } from '@/lib/api-client'
import type { WsNotificationPayload, WsUnreadCountPayload } from '@/types/notification'

function buildWsUrl(): string | null {
  const auth = authStorage.get()
  if (!auth?.access) return null

  const base = import.meta.env.VITE_API_BASE_URL
  if (base) {
    // Prod: VITE_API_BASE_URL is an absolute https URL — swap scheme for wss.
    const wsBase = base.replace(/^http/, 'ws')
    return `${wsBase}/ws/notifications/?token=${auth.access}`
  }
  // Dev: relative to this origin, forwarded by the Vite proxy (server.proxy['/ws'] in vite.config.ts).
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/notifications/?token=${auth.access}`
}

/**
 * Live updates for the notification bell — reconnects with backoff, and simply does nothing if
 * the socket can't stay up (the bell still works via useUnreadCount()'s polling refetchInterval,
 * so a dropped socket degrades to polling rather than breaking the feature).
 */
export function useNotificationSocket(enabled: boolean) {
  const qc = useQueryClient()
  const retryRef = useRef(0)
  const socketRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const connect = () => {
      const url = buildWsUrl()
      if (!url || cancelled) return

      const ws = new WebSocket(url)
      socketRef.current = ws

      ws.onopen = () => {
        retryRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WsNotificationPayload | WsUnreadCountPayload
          if (data.type === 'unread_count') {
            qc.setQueryData(['notifications', 'unread-count'], data.count)
          } else {
            qc.invalidateQueries({ queryKey: ['notifications'] })
            toast.info(data.title, { description: data.body })
          }
        } catch {
          /* ignore malformed frames */
        }
      }

      ws.onclose = () => {
        if (cancelled) return
        const delay = Math.min(30_000, 1000 * 2 ** retryRef.current)
        retryRef.current += 1
        timerRef.current = setTimeout(connect, delay)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(timerRef.current)
      socketRef.current?.close()
    }
  }, [enabled, qc])
}
