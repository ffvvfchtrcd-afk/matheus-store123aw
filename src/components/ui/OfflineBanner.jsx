import { useState, useEffect } from 'react'

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-600/90 backdrop-blur-sm text-white text-center py-2 px-4 text-sm font-medium" role="alert" aria-live="assertive">
      Você está offline. Algumas funcionalidades podem não estar disponíveis.
    </div>
  )
}
