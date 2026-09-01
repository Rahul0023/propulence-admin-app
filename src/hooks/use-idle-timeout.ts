import { useEffect, useRef, useState } from 'react'

const IDLE_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const

/**
 * Client-side inactivity prompt only. NOT backend-enforced: SuperAdminLoginView doesn't set the
 * `sid` claim SessionJWTAuthentication checks, so the server never revokes a superadmin token on
 * idle — real expiry is the 7-day access-token lifetime via the 401→refresh flow. This is purely
 * a UX courtesy matching the PRD's "session expiry" expectation.
 */
export function useIdleTimeout(minutes = 30) {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const reset = () => {
      setIsIdle(false)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setIsIdle(true), minutes * 60_000)
    }

    reset()
    IDLE_EVENTS.forEach((evt) => window.addEventListener(evt, reset))
    return () => {
      clearTimeout(timerRef.current)
      IDLE_EVENTS.forEach((evt) => window.removeEventListener(evt, reset))
    }
  }, [minutes])

  return { isIdle, dismiss: () => setIsIdle(false) }
}
