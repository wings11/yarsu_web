'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import type { Message } from '@/lib/supabase'

interface ChatContextType {
  socket: any | null
  connected: boolean
  onlineUsers: string[]
  sendMessage: (chatId: number, message: string, type?: string) => void
  joinChat: (chatId: number) => void
  leaveChat: (chatId: number) => void
  newMessages: Message[]
  clearNewMessages: () => void
  activeChats: Set<number>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<any | null>(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [newMessages, setNewMessages] = useState<Message[]>([])
  const [activeChats, setActiveChats] = useState<Set<number>>(new Set())
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Enhanced polling mechanism for real-time message updates
  const startMessagePolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }
    
    pollIntervalRef.current = setInterval(() => {
      // Only poll if there are active chats and window is focused
      if (activeChats.size > 0 && !document.hidden) {
        // Invalidate all active chat queries to force refetch
        activeChats.forEach(chatId => {
          queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
        })
        
        // Also invalidate chats list to update last message times
        queryClient.invalidateQueries({ queryKey: ['chats-with-users'] })
      }
    }, 8000) // Poll every 8 seconds (less aggressive than before)
  }, [activeChats, queryClient])

  useEffect(() => {
    if (!user?.id) {
      if (connected) {
        setConnected(false)
        // Clear polling when disconnecting
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
      }
      return
    }

    // Only initialize if not already connected and user is authenticated
    if (!connected && user.id) {
      setConnected(true)
      
      // Start enhanced message polling for real-time updates
      startMessagePolling()
    }

    return () => {
      // Cleanup on unmount only
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [user?.id, connected, startMessagePolling])

  // Handle visibility change for better performance
  useEffect(() => {
    let lastVisibilityChange = Date.now()
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastVisibilityChange = Date.now()
        // Stop polling when tab is not visible
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
      } else {
        // Only resume polling if we've been away for more than 2 minutes
        // This prevents unnecessary refetching for quick tab switches
        const timeAway = Date.now() - lastVisibilityChange
        if (connected && !pollIntervalRef.current && timeAway > 2 * 60 * 1000) {
          startMessagePolling()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [connected, startMessagePolling])

  // Restart polling when activeChats changes
  useEffect(() => {
    if (connected && !document.hidden) {
      startMessagePolling()
    }
  }, [activeChats.size, connected, startMessagePolling])

  const sendMessage = useCallback((chatId: number, message: string, type: string = 'text') => {
    // Immediately refresh the messages and chats to show the sent message and reorder
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats-with-users'] })
    }, 200) // Reduced delay for more immediate feedback
  }, [queryClient])

  const joinChat = useCallback((chatId: number) => {
    setActiveChats(prev => {
      const newSet = new Set(prev)
      newSet.add(chatId)
      return newSet
    })
    
    // Immediately fetch messages for this chat
    queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
  }, [queryClient])

  const leaveChat = useCallback((chatId: number) => {
    setActiveChats(prev => {
      const newSet = new Set(prev)
      newSet.delete(chatId)
      return newSet
    })
  }, [])

  const clearNewMessages = useCallback(() => {
    setNewMessages([])
  }, [])

  const value = {
    socket,
    connected,
    onlineUsers,
    sendMessage,
    joinChat,
    leaveChat,
    newMessages,
    clearNewMessages,
    activeChats,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
