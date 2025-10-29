'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import type { Message } from '@/lib/supabase'
import { io, Socket } from 'socket.io-client'

interface ChatContextType {
  socket: Socket | null
  connected: boolean
  onlineUsers: string[]
  sendMessage: (chatId: number, message: string, type?: string) => void
  joinChat: (chatId: number) => void
  leaveChat: (chatId: number) => void
  newMessages: Message[]
  clearNewMessages: () => void
  activeChats: Set<number>
  sendTypingIndicator: (chatId: number, isTyping: boolean) => void
  typingUsers: Map<number, Set<string>>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yarsu-backend.onrender.com'

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [newMessages, setNewMessages] = useState<Message[]>([])
  const [activeChats, setActiveChats] = useState<Set<number>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Map<number, Set<string>>>(new Map())
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const socketRef = useRef<Socket | null>(null)

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user?.id) {
      // Disconnect socket if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
      }
      return
    }

    // Only initialize socket once per user session
    if (!socketRef.current && user.id) {
      console.log('Initializing Socket.io connection to:', SOCKET_URL)
      
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: {
          userId: user.id,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 Socket.io connected:', newSocket.id)
        setConnected(true)
        
        // Identify user after connection
        console.log('🆔 Identifying user:', user.id)
        newSocket.emit('identify', user.id)
        
        // Rejoin active chats after reconnection
        const currentActiveChats = Array.from(activeChats)
        console.log('🔄 Rejoining active chats:', currentActiveChats)
        currentActiveChats.forEach(chatId => {
          console.log(`  📥 Joining chat room: chat_${chatId}`)
          newSocket.emit('join_chat', chatId, user.id)
        })
      })

      newSocket.on('disconnect', () => {
        console.log('Socket.io disconnected')
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error)
        setConnected(false)
      })

      // User presence events
      newSocket.on('online_users', (users: string[]) => {
        setOnlineUsers(users)
      })

      newSocket.on('user_joined', (userId: string) => {
        setOnlineUsers(prev => {
          const uniqueUsers = new Set(prev)
          uniqueUsers.add(userId)
          return Array.from(uniqueUsers)
        })
      })

      newSocket.on('user_left', (userId: string) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId))
      })

      // Message events
      newSocket.on('new_message', ({ chatId, message }: { chatId: number, message: Message }) => {
        console.log('📨 RECEIVED new_message event via Socket.io')
        console.log('  chatId:', chatId)
        console.log('  message.id:', message.id)
        console.log('  current user:', user.id)
        console.log('  sender:', message.sender_id)
        
        // Add to new messages if not from current user
        if (message.sender_id !== user.id) {
          console.log('  ✅ Message from OTHER user - adding to newMessages')
          setNewMessages(prev => [...prev, message])
        } else {
          console.log('  ℹ️ Message from SELF - not adding to newMessages')
        }
        
        // INSTANT UPDATE: Directly update the React Query cache instead of invalidating
        console.log('  🔄 Updating React Query cache for messages', chatId)
        queryClient.setQueryData(['messages', chatId], (oldMessages: Message[] | undefined) => {
          if (!oldMessages) {
            console.log('  ⚠️ No existing messages, creating new array')
            return [message]
          }
          
          // Check if message already exists (prevent duplicates)
          const exists = oldMessages.some(m => {
            // Check by ID first (most reliable)
            if (m.id === message.id) {
              console.log('  ⚠️ Duplicate detected by ID:', message.id)
              return true
            }
            
            // Also check by content and timestamp (within 3 seconds) as fallback
            // This prevents duplicates when Socket event arrives before/after refetch
            const isSameContent = m.message === message.message
            const isSameSender = m.sender_id === message.sender_id
            const timeDiff = Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime())
            
            if (isSameContent && isSameSender && timeDiff < 3000) {
              console.log('  ⚠️ Duplicate detected by content+time:', {
                content: message.message,
                timeDiff: timeDiff + 'ms'
              })
              return true
            }
            
            return false
          })
          
          if (exists) {
            console.log('  ❌ Skipping duplicate message')
            return oldMessages
          }
          
          console.log('  ✅ Adding NEW message to cache, total:', oldMessages.length + 1)
          // Add new message to the end
          return [...oldMessages, message]
        })
        
        // Also update the chats list to show latest message and reorder
        console.log('  🔄 Invalidating chats list')
        queryClient.invalidateQueries({ queryKey: ['chats-with-users'] })
        console.log('  ✅ Socket.io message handling complete')
      })

      // Typing indicator events
      newSocket.on('user_typing', ({ chatId, userId, isTyping }: { chatId: number, userId: string, isTyping: boolean }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev)
          const chatTypers = newMap.get(chatId) || new Set<string>()
          const updatedTypers = new Set(chatTypers)
          
          if (isTyping) {
            updatedTypers.add(userId)
          } else {
            updatedTypers.delete(userId)
          }
          
          if (updatedTypers.size > 0) {
            newMap.set(chatId, updatedTypers)
          } else {
            newMap.delete(chatId)
          }
          
          return newMap
        })
      })

      // Message read event
      newSocket.on('message_read_update', ({ chatId, messageId }: { chatId: number, messageId: number }) => {
        queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      })

      socketRef.current = newSocket
      setSocket(newSocket)
    }

    return () => {
      // Only disconnect on unmount, not on every re-render
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, queryClient])

  // Fallback polling for when socket is disconnected (minimal)
  useEffect(() => {
    if (!connected && activeChats.size > 0 && !document.hidden) {
      // Only poll if socket is disconnected as fallback
      const currentChats = Array.from(activeChats)
      pollIntervalRef.current = setInterval(() => {
        currentChats.forEach(chatId => {
          queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
        })
        queryClient.invalidateQueries({ queryKey: ['chats-with-users'] })
      }, 30000) // Poll every 30 seconds as fallback only
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, activeChats.size, queryClient])

  const sendMessage = useCallback((chatId: number, message: string, type: string = 'text') => {
    // Socket.io will handle real-time updates via new_message event
    // Just invalidate queries after a short delay for the API call to complete
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats-with-users'] })
    }, 200)
  }, [queryClient])

  const joinChat = useCallback((chatId: number) => {
    console.log(`📥 joinChat called for chatId: ${chatId}`)
    setActiveChats(prev => {
      const newSet = new Set(prev)
      newSet.add(chatId)
      console.log(`  Active chats updated:`, Array.from(newSet))
      return newSet
    })
    
    // Emit join_chat event to Socket.io
    if (socketRef.current && user?.id) {
      console.log(`  📤 Emitting join_chat to Socket.io: chat_${chatId}`)
      socketRef.current.emit('join_chat', chatId, user.id)
    } else {
      console.warn(`  ⚠️ Cannot emit join_chat - socket:`, !!socketRef.current, 'user:', user?.id)
    }
    
    // Fetch messages for this chat
    queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
  }, [queryClient, user?.id])

  const leaveChat = useCallback((chatId: number) => {
    setActiveChats(prev => {
      const newSet = new Set(prev)
      newSet.delete(chatId)
      return newSet
    })
    
    // Emit leave_chat event to Socket.io
    if (socketRef.current && user?.id) {
      socketRef.current.emit('leave_chat', chatId, user.id)
    }
  }, [user?.id])

  const sendTypingIndicator = useCallback((chatId: number, isTyping: boolean) => {
    if (socketRef.current && user?.id) {
      socketRef.current.emit('typing', { chatId, userId: user.id, isTyping })
    }
  }, [user?.id])

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
    sendTypingIndicator,
    typingUsers,
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
