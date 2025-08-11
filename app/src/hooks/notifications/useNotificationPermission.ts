'use client'

import { useCallback, useEffect, useState } from 'react'

export function useNotificationPermission() {
  const [granted, setGranted] = useState<boolean | null>(null)

  const request = useCallback(async () => {
    try {
      if (!('Notification' in window)) {
        setGranted(false)
        return false
      }
      const result = await Notification.requestPermission()
      const ok = result === 'granted'
      setGranted(ok)
      return ok
    } catch {
      setGranted(false)
      return false
    }
  }, [])

  useEffect(() => {
    if (!('Notification' in window)) {
      setGranted(false)
      return
    }
    setGranted(Notification.permission === 'granted')
  }, [])

  return { granted, request }
} 