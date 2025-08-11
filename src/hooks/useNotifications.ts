import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NotificationState {
  [chatId: string]: number // timestamp of last notification
}

export function useNotifications() {
  const { user } = useAuth()
  const notificationStateRef = useRef<NotificationState>({})
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Request notification permission on mount
  useEffect(() => {
    if (isAdmin && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [isAdmin])

  const canSendNotification = (chatId: number): boolean => {
    if (!isAdmin || !('Notification' in window) || Notification.permission !== 'granted') {
      return false
    }

    const now = Date.now()
    const lastNotification = notificationStateRef.current[chatId.toString()]
    const tenMinutesAgo = now - (10 * 60 * 1000) // 10 minutes in milliseconds

    // Can send notification if:
    // 1. No previous notification for this chat, OR
    // 2. Last notification was more than 10 minutes ago
    return !lastNotification || lastNotification < tenMinutesAgo
  }

  const sendNotification = (chatId: number, userEmail: string, message: string) => {
    if (!canSendNotification(chatId)) {
      return
    }

    try {
      const notification = new Notification(`New message from ${userEmail}`, {
        body: message.length > 50 ? message.substring(0, 47) + '...' : message,
        icon: '/favicon.ico', // You can customize this
        tag: `chat-${chatId}`, // This ensures only one notification per chat
        requireInteraction: false,
        silent: false
      })

      // Update the last notification time
      notificationStateRef.current[chatId.toString()] = Date.now()

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Handle notification click - focus the browser window
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  const checkForNewMessages = (
    currentMessages: any[], 
    previousMessages: any[], 
    chatId: number, 
    userEmail: string
  ) => {
    if (!isAdmin || !currentMessages || !previousMessages) {
      return
    }

    // Find messages that are in current but not in previous (new messages)
    const newMessages = currentMessages.filter(current => 
      !previousMessages.find(prev => prev.id === current.id)
    )

    // Only notify for messages NOT sent by admin
    const userMessages = newMessages.filter(msg => msg.sender_id !== user?.id)

    if (userMessages.length > 0 && canSendNotification(chatId)) {
      // Send notification for the latest message
      const latestMessage = userMessages[userMessages.length - 1]
      sendNotification(chatId, userEmail, latestMessage.message)
    }
  }

  return {
    canSendNotification,
    sendNotification,
    checkForNewMessages,
    isNotificationSupported: 'Notification' in window,
    notificationPermission: 'Notification' in window ? Notification.permission : 'denied'
  }
}
