self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  self.clients.claim()
})

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {}
    const title = data.title || '通知'
    const body = data.body || data.message || ''
    const options = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'timer-notification',
      requireInteraction: false,
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch (e) {
    // Fallback if payload is not JSON
    event.waitUntil(self.registration.showNotification('通知', { body: event.data && event.data.text() }))
  }
})

self.addEventListener('message', (event) => {
  const data = event.data || {}
  if (data && data.type === 'notify') {
    const title = data.title || '通知'
    const body = data.body || data.message || ''
    const options = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'timer-notification',
      requireInteraction: false,
    }
    event.waitUntil(self.registration.showNotification(title, options))
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    })
  )
}) 