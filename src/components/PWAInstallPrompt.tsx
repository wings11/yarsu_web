'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Update UI notify the user they can install the PWA
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      // Hide the app-provided install promotion
      setShowInstallButton(false)
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  // Don't show anything if already installed or no prompt available
  if (isInstalled || !showInstallButton) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <img src="/images/logo.png" alt="YarSu" className="h-10 w-10 rounded" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Install YarSu App
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get quick access and offline features
          </p>
        </div>
      </div>
      <div className="mt-3 flex space-x-2">
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="flex-1"
        >
          Install
        </Button>
        <Button
          onClick={() => setShowInstallButton(false)}
          variant="secondary"
          size="sm"
          className="flex-1"
        >
          Maybe Later
        </Button>
      </div>
    </div>
  )
}
