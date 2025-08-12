'use client'

import { useEffect } from 'react'

export default function BrowserOptimization() {
  useEffect(() => {
    // Prevent browser from discarding this tab
    const keepAlive = () => {
      // Send a tiny beacon to keep the tab "active" in browser's eyes
      if ('navigator' in window && 'sendBeacon' in navigator) {
        navigator.sendBeacon('/api/keepalive', new Blob(['ping'], { type: 'text/plain' }))
      }
    }

    // Keep tab alive every 5 minutes
    const keepAliveInterval = setInterval(keepAlive, 5 * 60 * 1000)

    // Restore scroll position on page load
    const restoreScrollPosition = () => {
      const savedScrollY = sessionStorage.getItem('scrollPosition')
      if (savedScrollY) {
        window.scrollTo(0, parseInt(savedScrollY))
        sessionStorage.removeItem('scrollPosition')
      }
    }

    // Save scroll position before page unload
    const saveScrollPosition = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString())
    }

    // Setup event listeners
    window.addEventListener('beforeunload', saveScrollPosition)
    restoreScrollPosition()

    // Performance optimization: Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Warm up cache for better performance
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration()
        }
      })
    }

    return () => {
      clearInterval(keepAliveInterval)
      window.removeEventListener('beforeunload', saveScrollPosition)
    }
  }, [])

  return null // This component doesn't render anything
}
