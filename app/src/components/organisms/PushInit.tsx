'use client'

import { useEffect } from 'react'

export default function PushInit() {
  useEffect(() => {
    const register = async () => {
      if (typeof window === 'undefined') return
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

      try {
        const reg = await navigator.serviceWorker.register('/sw.js')

        // Read VAPID public key from env-exposed runtime config if available
        const vapidPublicKey = (process as any).env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string | undefined
        if (!vapidPublicKey) return

        const existing = await reg.pushManager.getSubscription()
        if (existing) return

        const convertedKey = urlBase64ToUint8Array(vapidPublicKey)
        await Notification.requestPermission()
        if (Notification.permission !== 'granted') return

        await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: convertedKey })
        // NOTE: Send subscription to server here if you implement server-side push later
      } catch (e) {
        console.warn('SW/Push setup skipped:', e)
      }
    }

    register()
  }, [])

  return null
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
} 