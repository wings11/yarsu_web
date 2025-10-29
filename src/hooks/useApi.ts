import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { supabase } from '@/lib/supabase'

// Chat hooks
export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      try {
        const data = await apiService.getChats()
        return data
      } catch (error) {
        throw error
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Enhanced chats hook with real user emails from Supabase users table
export function useChatsWithUsers() {
  return useQuery({
    queryKey: ['chats-with-users'],
    queryFn: async () => {
      try {
        // Get all chats from backend
        const chats = await apiService.getChats()
        
        if (!chats || chats.length === 0) {
          return []
        }

        // Extract unique user IDs from chats
        const userIds = Array.from(new Set(chats.map((chat: any) => chat.user_id)))
        
        // Get real user data from Supabase users table (RLS disabled)
        const { data: users, error } = await supabase
          .from('users')
          .select('id, email, role, name')
          .in('id', userIds)
        
        if (error) {
          throw error
        }
        
        // Create a user lookup map
        const userMap = new Map()
        users?.forEach((user: any) => {
          userMap.set(user.id, {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
          })
        })
        
        // Get last message for each chat to enable proper sorting
        const chatsWithLastMessage = await Promise.all(
          chats.map(async (chat: any) => {
            try {
              const { data: lastMessage } = await supabase
                .from('messages')
                .select('created_at')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
              
              return {
                ...chat,
                user: userMap.get(chat.user_id) || { 
                  id: chat.user_id,
                  email: `unknown-user-${chat.user_id.slice(-8)}@yarsu.app` // Fallback for missing users
                },
                last_message_at: lastMessage?.created_at || chat.created_at
              }
            } catch (error) {
              // If no messages found, use chat creation time
              return {
                ...chat,
                user: userMap.get(chat.user_id) || { 
                  id: chat.user_id,
                  email: `unknown-user-${chat.user_id.slice(-8)}@yarsu.app`
                },
                last_message_at: chat.created_at
              }
            }
          })
        )
        
        // Sort by last message time (most recent first)
        const sortedChats = chatsWithLastMessage.sort((a, b) => {
          return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        })
        
        return sortedChats
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes since user data doesn't change often
    gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
  })
}

export function useMessages(chatId: number) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => apiService.getMessages(chatId),
    enabled: !!chatId,
    refetchInterval: 10000, // Poll every 10 seconds (less aggressive)
    refetchIntervalInBackground: false, // Stop polling when tab is not active
    staleTime: 5000, // Consider data stale after 5 seconds
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ message, chatId, type, file }: { 
      message: string, 
      chatId?: number, 
      type?: string,
      file?: File
    }) => {
      return apiService.sendMessage(message, chatId, type, file)
    },
    onSuccess: (data: any, { chatId }: any) => {
      if (chatId) {
        queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      }
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (error: any) => {
      console.error('Send message error:', error)
    }
  })
}

export function useReplyMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ message, chatId, type, file }: { 
      message: string, 
      chatId: number, 
      type?: string,
      file?: File
    }) =>
      apiService.replyMessage(message, chatId, type, file),
    onSuccess: (_: any, { chatId }: any) => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      queryClient.invalidateQueries({ queryKey: ['chats-with-users'] })
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] })
    },
    onError: () => {
      
    }
  })
}

// Unread count hooks
export function useUnreadCounts() {
  return useQuery({
    queryKey: ['unread-counts'],
    queryFn: () => apiService.getUnreadCounts(),
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider stale after 5 seconds
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ type, id }: { type: 'message' | 'chat', id: number }) => {
      if (type === 'message') {
        return apiService.markMessageAsRead(id)
      } else {
        return apiService.markChatAsRead(id)
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] })
      queryClient.invalidateQueries({ queryKey: ['chats-with-users'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }
  })
}

// Content hooks
export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getRestaurants()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useHotels() {
  return useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getHotels()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache (renamed from cacheTime in v5)
  })
}

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getJobs()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getCourses()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useCondos() {
  return useQuery({
    queryKey: ['condos'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getCondos()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useTravelPosts() {
  return useQuery({
    queryKey: ['travel-posts'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getTravelPosts()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useGeneralPosts() {
  return useQuery({
    queryKey: ['general-posts'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getGeneralPosts()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useDocs() {
  return useQuery({
    queryKey: ['docs'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getDocs()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useLinks() {
  return useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getLinks()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useHighlights() {
  return useQuery({
    queryKey: ['highlights'],
    queryFn: async () => {
      
      try {
        const data = await apiService.getHighlights()
        
        return data
      } catch (error) {
        
        throw error
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  })
}

// Job inquiry hook
export function useSubmitJobInquiry() {
  return useMutation({
    mutationFn: ({ jobId, inquiryData }: { jobId: number, inquiryData: any }) =>
      apiService.submitJobInquiry(jobId, inquiryData),
    onSuccess: () => {
      
    },
    onError: () => {
      
    }
  })
}
