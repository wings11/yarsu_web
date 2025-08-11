'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useGeneralPosts } from '@/hooks/useApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { Calendar, Plus, Edit, Trash2, Image as ImageIcon, Video, X, Upload } from 'lucide-react'
import { isImageUrl, isVideoUrl } from '@/utils/mediaUtils'
import type { GeneralPost } from '@/lib/supabase'

export default function GeneralPostManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingPost, setEditingPost] = useState<GeneralPost | null>(null)
  const { data: posts, isLoading } = useGeneralPosts()
  const queryClient = useQueryClient()

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { text: string; media: string[] }) => {
      return await apiService.createGeneralPost(postData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-posts'] })
      setIsCreating(false)
    },
    onError: (error: any) => {
      console.error('Create post error:', error)
      alert(`Failed to create post: ${error.message}`)
    }
  })

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiService.deleteGeneralPost(postId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-posts'] })
    },
    onError: (error: any) => {
      console.error('Delete post error:', error)
      alert(`Failed to delete post: ${error.message}`)
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">General Posts</h2>
          <p className="text-sm md:text-base text-gray-600">Create and manage general posts and announcements</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2 w-full md:w-auto justify-center">
          <Plus className="h-4 w-4" />
          <span>New Post</span>
        </Button>
      </div>

      {/* Create/Edit Post Form */}
      {(isCreating || editingPost) && (
        <PostForm
          post={editingPost}
          onSave={(postData) => {
            if (editingPost) {
              // Update logic here
            } else {
              createPostMutation.mutate(postData)
            }
          }}
          onCancel={() => {
            setIsCreating(false)
            setEditingPost(null)
          }}
          isLoading={createPostMutation.isPending}
        />
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts?.map((post: GeneralPost) => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 space-y-2 md:space-y-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPost(post)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePostMutation.mutate(post.id)}
                  disabled={deletePostMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none mb-4">
              <p className="whitespace-pre-wrap text-sm md:text-base">{post.text}</p>
            </div>
            
            {/* Media Display */}
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.media.map((mediaUrl, index) => (
                  <MediaDisplay key={index} url={mediaUrl} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {(!posts || posts.length === 0) && (
        <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Plus className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first post.
          </p>
        </div>
      )}
    </div>
  )
}

// Post Form Component
function PostForm({ 
  post, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  post?: GeneralPost | null
  onSave: (data: { text: string; media: string[] }) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [text, setText] = useState(post?.text || '')
  const [mediaUrls, setMediaUrls] = useState<string[]>(post?.media || [])
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [draftRestored, setDraftRestored] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Autosave key for localStorage
  const AUTOSAVE_KEY = 'yarsu_general_post_draft'

  // Load saved draft on component mount (only for new posts)
  useEffect(() => {
    if (!post) { // Only restore for new posts, not when editing
      try {
        const savedDraft = localStorage.getItem(AUTOSAVE_KEY)
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft)
          if (parsed.text || (parsed.mediaUrls && parsed.mediaUrls.length > 0)) {
            setText(parsed.text || '')
            setMediaUrls(parsed.mediaUrls || [])
            setDraftRestored(true)
            console.log('Restored draft from autosave')
            
            // Hide the restored message after 5 seconds
            setTimeout(() => setDraftRestored(false), 5000)
          }
        }
      } catch (error) {
        console.warn('Failed to restore autosave draft:', error)
        localStorage.removeItem(AUTOSAVE_KEY)
      }
    }
  }, [post])

  // Autosave to localStorage whenever form data changes
  useEffect(() => {
    if (!post) { // Only autosave for new posts, not when editing
      const draftData = {
        text: text.trim(),
        mediaUrls,
        lastSaved: Date.now()
      }
      
      // Only save if there's actual content
      if (draftData.text || draftData.mediaUrls.length > 0) {
        try {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draftData))
        } catch (error) {
          console.warn('Failed to autosave draft:', error)
        }
      }
    }
  }, [text, mediaUrls, post])

  // Clear autosave on successful save or cancel
  const clearAutosave = () => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY)
      console.log('Cleared autosave draft')
    } catch (error) {
      console.warn('Failed to clear autosave:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    
    onSave({ text: text.trim(), media: mediaUrls })
    
    // Clear autosave after successful submission
    clearAutosave()
  }

  const handleCancel = () => {
    // Clear autosave when canceling
    clearAutosave()
    onCancel()
  }

  const addMediaUrl = () => {
    if (newMediaUrl.trim() && !mediaUrls.includes(newMediaUrl.trim())) {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()])
      setNewMediaUrl('')
    }
  }

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index))
  }

  // Handle file upload for images only
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file. For videos, use URL instead.')
      return
    }

    // For demo: just use local URL. In production, upload to server/storage and get public URL.
    const url = URL.createObjectURL(file)
    setMediaUrls([...mediaUrls, url])
    
    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          {post ? 'Edit Post' : 'Create New Post'}
        </h3>
        {draftRestored && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded-md text-sm flex items-center space-x-1">
            <span>✓</span>
            <span>Draft restored</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your post content here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media URLs (Images/Videos)
          </label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
            <Input
              type="url"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="Enter image or video URL..."
              className="flex-1"
            />
            <Button type="button" onClick={addMediaUrl} variant="secondary" className="w-full sm:w-auto">
              Add URL
            </Button>
          </div>
          
          {/* File Upload Option */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">
              Or upload image file:
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: File upload only supports images. For videos, use the URL field above.
            </p>
          </div>
          
          {/* Media Preview */}
          {mediaUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Media files:</p>
              {mediaUrls.map((url, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-2 rounded border space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 min-w-0">
                    {isVideoUrl(url) ? (
                      <Video className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{url}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMediaUrl(index)}
                    className="self-end sm:self-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button type="submit" disabled={isLoading || !text.trim()} className="w-full sm:w-auto">
            {isLoading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

// Media Display Component
function MediaDisplay({ url }: { url: string }) {
  if (isVideoUrl(url)) {
    return (
      <div className="relative">
        <VideoPlayer
          url={url}
          className="w-full h-32 sm:h-40 md:h-48 rounded-lg"
          showTitle={false}
        />
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Video
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <img
        src={url}
        alt="Post media"
        className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        Image
      </div>
    </div>
  )
}
