'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { useChats, useMessages, useSendMessage, useReplyMessage, useChatsWithUsers } from '@/hooks/useApi'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatDate } from '@/lib/utils'
import { Send, Phone, Video, ArrowLeft, RefreshCw, Bell, BellOff } from 'lucide-react'
import type { Chat, Message } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messageText, setMessageText] = useState('')
  const [showChatList, setShowChatList] = useState(true) // For mobile navigation
  const { user } = useAuth()
  const { socket, joinChat, leaveChat, sendMessage, newMessages, activeChats } = useChat()
  const { data: chats, isLoading: chatsLoading, refetch: refetchChats } = useChatsWithUsers() // Use enhanced hook for admin
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useMessages(selectedChat?.id || 0)
  const sendMessageMutation = useSendMessage()
  const replyMessageMutation = useReplyMessage()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const previousMessagesRef = useRef<any[]>([])
  
  // Notification system
  const { checkForNewMessages, notificationPermission } = useNotifications()

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, newMessages])

  // Check for new messages and send notifications (admin only)
  useEffect(() => {
    if (isAdmin && messages && selectedChat) {
      const userEmail = selectedChat.user?.email || `User ${selectedChat.user_id.slice(-4)}`
      
      checkForNewMessages(
        messages,
        previousMessagesRef.current,
        selectedChat.id,
        userEmail
      )
      
      // Update the previous messages reference
      previousMessagesRef.current = messages || []
    }
  }, [messages, selectedChat, isAdmin, checkForNewMessages])

  // Join/leave chat rooms - Fixed to prevent infinite loop
  useEffect(() => {
    if (selectedChat) {
      joinChat(selectedChat.id)
      return () => {
        leaveChat(selectedChat.id)
      }
    }
  }, [selectedChat, joinChat, leaveChat]) // Now safe to include functions since they're memoized

  // For regular users, auto-create or select their chat
  useEffect(() => {
    if (!isAdmin && chats && chats.length > 0) {
      const userChat = chats.find((chat: Chat) => chat.user_id === user?.id)
      if (userChat) {
        setSelectedChat(userChat)
      }
    }
  }, [chats, isAdmin, user?.id])

  // Handle mobile chat selection
  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
    if (window.innerWidth < 768) { // Mobile breakpoint
      setShowChatList(false)
    }
  }

  // Handle mobile back to chat list
  const handleBackToChatList = () => {
    setShowChatList(true)
    setSelectedChat(null)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim() || !selectedChat) {
      return
    }

    // Send via socket for real-time (this will trigger immediate refresh)
    sendMessage(selectedChat.id, messageText.trim())
    
    // Send via API for persistence
    try {
      if (isAdmin) {
        // Admin uses reply endpoint
        await replyMessageMutation.mutateAsync({
          message: messageText.trim(),
          chatId: selectedChat.id
        })
      } else {
        // Regular user uses messages endpoint
        await sendMessageMutation.mutateAsync({
          message: messageText.trim(),
          chatId: selectedChat.id
        })
      }
      
      // Force immediate refresh of messages and chats
      refetchMessages()
      refetchChats()
    } catch (error) {
      console.error('Failed to send message:', error)
    }

    setMessageText('')
  }

  // Combine API messages with new socket messages
  const allMessages = [...(messages || []), ...newMessages.filter((msg: Message) => msg.chat_id === selectedChat?.id)]

  if (chatsLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Mobile view for regular users
  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-primary-700 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Support Chat</h1>
              <p className="text-sm text-primary-100">Chat with our team</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-primary-700">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-primary-700">
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages - No bottom padding needed for fullscreen */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messagesLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {allMessages.map((message: Message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  isOwn={message.sender_id === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message input - No fixed positioning needed for fullscreen chat */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage}>
            <div className="flex space-x-2 sm:space-x-3">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-base px-3 py-3 sm:px-4 sm:py-3 rounded-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              />
              <Button 
                type="submit" 
                disabled={!messageText.trim()} 
                size="md" 
                className="px-4 sm:px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Admin view - Responsive design
  return (
    <div className="h-screen flex bg-white">
      {/* Chat list sidebar - Hidden on mobile when chat is selected */}
      <div className={`${
        showChatList ? 'w-full md:w-1/3' : 'hidden md:flex md:w-1/3'
      } border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">{chats?.length || 0} conversations</p>
                {/* Notification status indicator */}
                {isAdmin && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={requestNotificationPermission}
                      disabled={notificationPermission === 'granted'}
                      className="flex items-center space-x-1 hover:bg-gray-100 p-1 rounded transition-colors"
                      title={notificationPermission === 'granted' ? "Notifications enabled" : "Click to enable notifications"}
                    >
                      {notificationPermission === 'granted' ? (
                        <Bell className="h-4 w-4 text-green-600" />
                      ) : (
                        <BellOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500">
                        {notificationPermission === 'granted' ? 'On' : 'Off'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Mobile back button */}
            <button
              onClick={() => router.push('/')}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chats?.map((chat: Chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChat?.id === chat.id}
              onClick={() => handleChatSelect(chat)}
            />
          ))}
        </div>
      </div>

      {/* Chat conversation - Full width on mobile when selected */}
      <div className={`${
        showChatList ? 'hidden md:flex md:flex-1' : 'flex flex-1'
      } flex-col`}>
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Mobile back button */}
                  <button
                    onClick={handleBackToChatList}
                    className="md:hidden p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedChat.user?.email || `unknown-user-${selectedChat.user_id.slice(-8)}@yarsu.app`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedChat.user?.role ? `${selectedChat.user.role} • Online` : 'Online'}
                    </p>
                  </div>
                  {/* Real-time status indicator */}
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Live</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {/* Manual refresh button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      refetchMessages()
                      refetchChats()
                    }}
                    disabled={messagesLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${messagesLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messagesLoading ? (
                <div className="flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  {allMessages.map((message: Message) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      isOwn={message.sender_id === user?.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200">
              <div className="flex space-x-2 sm:space-x-3">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-base px-3 py-3 sm:px-4 sm:py-3 rounded-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
                <Button 
                  type="submit" 
                  disabled={!messageText.trim()} 
                  size="md" 
                  className="px-4 sm:px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ChatListItem({ 
  chat, 
  isSelected, 
  onClick 
}: { 
  chat: Chat
  isSelected: boolean
  onClick: () => void 
}) {
  const userEmail = chat.user?.email || `unknown-user-${chat.user_id.slice(-8)}@yarsu.app`
  const avatarInitials = chat.user?.email 
    ? chat.user.email.slice(0, 2).toUpperCase()
    : chat.user_id.slice(0, 2).toUpperCase()

  const lastActivity = chat.last_message_at || chat.created_at

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-primary-50 border-primary-200' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
          {avatarInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userEmail}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(lastActivity)}
          </p>
        </div>
        {/* New message indicator */}
        {!isSelected && (
          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message, isOwn }: { message: Message, isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-primary-600 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        <p className="text-sm">{message.message}</p>
        <p className={`text-xs mt-1 ${
          isOwn ? 'text-primary-100' : 'text-gray-500'
        }`}>
          {formatDate(message.created_at)}
        </p>
      </div>
    </div>
  )
}
