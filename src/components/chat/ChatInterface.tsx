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
import { formatDate, formatChatTime, getUserDisplayName, getUserInitials } from '@/lib/utils'
import { Send, Phone, Video, ArrowLeft, RefreshCw, Bell, BellOff } from 'lucide-react'
import type { Chat, Message } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import FileAttachment from './FileAttachment'
import FileMessage from './FileMessage'

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messageText, setMessageText] = useState('')
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedFileUrl, setAttachedFileUrl] = useState<string>('')
  const [attachedFileName, setAttachedFileName] = useState<string>('')
  const [attachedFileType, setAttachedFileType] = useState<string>('')
  const [clearFilePreview, setClearFilePreview] = useState(false)
  const [showChatList, setShowChatList] = useState(true) // For mobile navigation
  const { user } = useAuth()
  const { socket, joinChat, leaveChat, sendMessage, newMessages, activeChats, sendTypingIndicator, typingUsers } = useChat()
  const { data: chats, isLoading: chatsLoading, refetch: refetchChats } = useChatsWithUsers() // Use enhanced hook for admin
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useMessages(selectedChat?.id || 0)
  const sendMessageMutation = useSendMessage()
  const replyMessageMutation = useReplyMessage()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const previousMessagesRef = useRef<any[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
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
      const userName = getUserDisplayName(selectedChat.user)
      
      checkForNewMessages(
        messages,
        previousMessagesRef.current,
        selectedChat.id,
        userName
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

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedChat) return
    
    // Send typing start event
    sendTypingIndicator(selectedChat.id, true)
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set timeout to send typing stop event after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(selectedChat.id, false)
    }, 3000)
  }

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
    
    if ((!messageText.trim() && !attachedFile) || !selectedChat) {
      return
    }

    const messageContent = messageText.trim()
    
    // Determine message type based on file category
    let messageType = 'text'
    if (attachedFile) {
      if (attachedFileType.startsWith('image/')) {
        messageType = 'image'
      } else if (attachedFileType.startsWith('video/')) {
        messageType = 'video' 
      } else {
        messageType = 'file'
      }
    }
    
    // For files, send appropriate message content
    const finalMessageContent = attachedFile 
      ? (messageContent || '') // For files, use the text message or empty string
      : messageContent
    
    // If no file attachment, send via socket for real-time
    if (!attachedFile) {
      sendMessage(selectedChat.id, finalMessageContent)
    }
    
    // Send via API for persistence (required for files, optional for text)
    const messagesQueryKey = ['messages', selectedChat.id]
    let previousMessages: any = null
    
    try {
      // Create optimistic message for immediate UI feedback (sender only)
      const optimisticMessage = {
        id: Date.now(), // Temporary ID
        chat_id: selectedChat.id,
        sender_id: user?.id,
        message: finalMessageContent,
        type: messageType,
        file_url: null,
        created_at: new Date().toISOString(),
        read_at: null,
        _optimistic: true // Flag to identify optimistic updates
      }

      // Save previous messages for rollback on error
      previousMessages = queryClient.getQueryData(messagesQueryKey)
      
      // Add optimistic message to cache immediately (for sender)
      queryClient.setQueryData(messagesQueryKey, (old: any) => {
        if (!old) return [optimisticMessage]
        return [...old, optimisticMessage]
      })

      if (isAdmin) {
        // Admin uses reply endpoint
        await replyMessageMutation.mutateAsync({
          message: finalMessageContent,
          chatId: selectedChat.id,
          type: messageType,
          file: attachedFile || undefined
        })
      } else {
        // Regular user uses messages endpoint
        await sendMessageMutation.mutateAsync({
          message: finalMessageContent,
          chatId: selectedChat.id,
          type: messageType,
          file: attachedFile || undefined
        })
      }
      
      // Socket.io will replace optimistic message with real one
      // Only refetch chats list to update last message preview
      refetchChats()
    } catch (error) {
      console.error('Failed to send message:', error)
      // On error, revert optimistic update
      if (previousMessages) {
        queryClient.setQueryData(messagesQueryKey, previousMessages)
      }
    }

    // Clear input and file attachment
    setMessageText('')
    clearAttachment()
    setClearFilePreview(true)
    
    // Reset the clear flag after a brief moment
    setTimeout(() => {
      setClearFilePreview(false)
    }, 100)
  }

  const handleFileSelect = (fileUrl: string, fileName: string, fileType: string, file?: File) => {
    setAttachedFileUrl(fileUrl)
    setAttachedFileName(fileName)
    setAttachedFileType(fileType)
    setAttachedFile(file || null)
    setClearFilePreview(false) // Reset clear flag when new file is selected
  }

  const clearAttachment = () => {
    setAttachedFileUrl('')
    setAttachedFileName('')
    setAttachedFileType('')
    setAttachedFile(null)
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
        {/* Main Header - Fixed at top */}
        <div className="fixed top-0 left-0 right-0 bg-primary-600 text-white p-4 flex items-center justify-between z-50">
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

        {/* Chat Details Header - Fixed below main header */}
        {selectedChat && (
          <div className="fixed top-[76px] left-0 right-0 p-4 border-b border-gray-200 bg-gray-50 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getUserDisplayName(selectedChat.user)}
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
              </div>
            </div>
          </div>
        )}

        {/* Messages - Scrollable area with proper margins */}
        <div 
          className={`overflow-y-auto p-4 space-y-4 custom-scrollbar ${
            selectedChat ? 'mt-[144px]' : 'mt-[76px]'
          } mb-[80px]`}
          style={{ height: 'calc(100vh - 156px)' }}
        >
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
              
              {/* Typing indicator */}
              {selectedChat && typingUsers.get(selectedChat.id) && typingUsers.get(selectedChat.id)!.size > 0 && (
                <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message input - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-200 bg-white z-30">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* File Attachment Button */}
              <FileAttachment
                onFileSelect={handleFileSelect}
                onClearFile={clearAttachment}
                shouldClear={clearFilePreview}
                disabled={false}
              />
              
              {/* Input with send button inside */}
              <div className="flex-1 relative">
                <Input
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value)
                    handleTyping()
                  }}
                  placeholder="Type your message..."
                  className="w-full text-base px-3 py-3 sm:px-4 sm:py-3 pr-14 rounded-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="submit" 
                  disabled={!messageText.trim() && !attachedFile}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
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
                      {getUserDisplayName(selectedChat.user)}
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
                  {/* <Button variant="ghost" size="sm">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-5 w-5" />
                  </Button> */}
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
                  
                  {/* Typing indicator */}
                  {selectedChat && typingUsers.get(selectedChat.id) && typingUsers.get(selectedChat.id)!.size > 0 && (
                    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>typing...</span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message input */}
            <div className="p-3 sm:p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage}>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* File Attachment Button */}
                  <FileAttachment
                    onFileSelect={handleFileSelect}
                    onClearFile={clearAttachment}
                    shouldClear={clearFilePreview}
                    disabled={false}
                  />
                  
                  {/* Input with send button inside */}
                  <div className="flex-1 relative">
                    <Input
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value)
                        handleTyping()
                      }}
                      placeholder="Type a message..."
                      className="w-full text-base px-3 py-3 sm:px-4 sm:py-3 pr-14 rounded-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    />
                    <button
                      type="submit" 
                      disabled={!messageText.trim() && !attachedFile}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:opacity-50 flex items-center justify-center transition-colors"
                    >
                      <Send className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
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
  const displayName = getUserDisplayName(chat.user)
  const avatarInitials = getUserInitials(chat.user)

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
            {displayName}
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
  const isFileMessage = (message.type === 'file' || message.type === 'image' || message.type === 'video') && message.file_url
  const isMediaMessage = (message.type === 'image' || message.type === 'video') && message.file_url

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      {isMediaMessage ? (
        // Media messages (images/videos) - no background bubble, just the media
        <div className={`max-w-xs sm:max-w-sm lg:max-w-md`}>
          <div className="relative">
            <FileMessage 
              fileUrl={message.file_url!}
              fileName={message.file_name || 'Media'}
              fileType={message.file_type || ''}
              isOwnMessage={isOwn}
            />
            {/* Caption overlay if there's a message */}
            {message.message && message.message.trim() && (
              <div className={`mt-1 px-3 py-2 rounded-lg ${
                isOwn 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  isOwn ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {formatChatTime(message.created_at)}
                </p>
              </div>
            )}
            {/* Timestamp without caption */}
            {(!message.message || !message.message.trim()) && (
              <p className={`text-xs mt-1 px-1 ${
                isOwn ? 'text-right text-gray-600' : 'text-left text-gray-500'
              }`}>
                {formatChatTime(message.created_at)}
              </p>
            )}
          </div>
        </div>
      ) : isFileMessage ? (
        // Non-media file messages - keep the bubble
        <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
          isOwn 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}>
          <FileMessage 
            fileUrl={message.file_url!}
            fileName={message.file_name || 'File'}
            fileType={message.file_type || ''}
            isOwnMessage={isOwn}
          />
          {message.message && message.message !== message.file_name && (
            <p className="text-sm mt-2">{message.message}</p>
          )}
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-primary-100' : 'text-gray-500'
          }`}>
            {formatChatTime(message.created_at)}
          </p>
        </div>
      ) : (
        // Text messages - regular bubble
        <div className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
          isOwn 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}>
          <p className="text-sm">{message.message}</p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-primary-100' : 'text-gray-500'
          }`}>
            {formatChatTime(message.created_at)}
          </p>
        </div>
      )}
    </div>
  )
}
