'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useGeneralPosts } from '@/hooks/useApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { apiService } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { Calendar, Plus, Edit, Trash2, Image as ImageIcon, Video, X, Upload } from 'lucide-react'
import { isImageUrl, isVideoUrl } from '@/utils/mediaUtils'
import type { GeneralPost } from '@/lib/supabase'
import { StorageService } from '@/lib/storage'

export default function GeneralPostManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingPost, setEditingPost] = useState<GeneralPost | null>(null)
  const { data: posts, isLoading } = useGeneralPosts()
  const queryClient = useQueryClient()

  // Default form values
  const defaultFormData = {
    text: '',
    media: [] as string[]
  }

  // Form persistence
  const {
    formData,
    updateFormData,
    resetForm: resetFormPersistence,
    clearDraft,
    saveDraft,
    hasUnsavedChanges,
    hasSavedDraft
  } = useFormPersistence({
    key: 'general-post-form',
    defaultValues: defaultFormData,
    autoSave: true,
    autoSaveDelay: 2000
  })

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { text: string; media: string[] }) => {
      return await apiService.createGeneralPost(postData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-posts'] })
      resetForm()
    },
    onError: (error: any) => {
      console.error('Create post error:', error)
      alert(`Failed to create post: ${error.message}`)
    }
  })

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, postData }: { postId: number; postData: { text: string; media: string[] } }) => {
      return await apiService.updateGeneralPost(postId, postData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-posts'] })
      resetForm()
    },
    onError: (error: any) => {
      console.error('Update post error:', error)
      alert(`Failed to update post: ${error.message}`)
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

  // Reset form
  const resetForm = () => {
    setIsCreating(false)
    setEditingPost(null)
    resetFormPersistence()
  }

  // Handle edit
  const handleEdit = (post: GeneralPost) => {
    setEditingPost(post)
    setIsCreating(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">General Posts Manager</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || !!editingPost}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Create/Edit Post Form */}
      {(isCreating || editingPost) && (
        <PostForm
          post={editingPost}
          onSave={(postData) => {
            if (editingPost) {
              updatePostMutation.mutate({ postId: editingPost.id, postData })
            } else {
              createPostMutation.mutate(postData)
            }
          }}
          onCancel={resetForm}
          isLoading={createPostMutation.isPending || updatePostMutation.isPending}
          formData={formData}
          updateFormData={updateFormData}
        />
      )}

      {/* Posts List - Enhanced Row Layout */}
      <div className="space-y-4">
        {!posts || posts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500">No posts found. Create your first post!</p>
          </div>
        ) : (
          posts.map((post: GeneralPost) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Header with date and actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => handleEdit(post)}
                    disabled={isCreating || !!editingPost}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this post?')) {
                        deletePostMutation.mutate(post.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Text content */}
                {post.text && (
                  <div className="prose max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{post.text}</p>
                  </div>
                )}

                {/* Media content */}
                {post.media && post.media.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                      Media Content ({post.media.length} item{post.media.length !== 1 ? 's' : ''})
                    </h4>
                    <div className="grid gap-4">
                      {post.media.map((mediaUrl: string, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {isImageUrl(mediaUrl) ? (
                                <ImageIcon className="h-5 w-5 text-blue-500" />
                              ) : isVideoUrl(mediaUrl) ? (
                                <Video className="h-5 w-5 text-red-500" />
                              ) : (
                                <div className="h-5 w-5 bg-gray-400 rounded" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 mb-2">
                                {isImageUrl(mediaUrl) ? 'Image' : 
                                 isVideoUrl(mediaUrl) ? 'Video' : 'Link'} #{index + 1}
                              </div>
                              
                              {/* Render media */}
                              {isImageUrl(mediaUrl) ? (
                                <div className="relative">
                                  <img 
                                    src={mediaUrl} 
                                    alt={`Media ${index + 1}`}
                                    className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ) : isVideoUrl(mediaUrl) ? (
                                <div className="max-w-md">
                                  <VideoPlayer url={mediaUrl} />
                                </div>
                              ) : (
                                <div className="text-sm text-blue-600 break-all">
                                  <a 
                                    href={mediaUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {mediaUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Post Form Component
function PostForm({ 
  post, 
  onSave, 
  onCancel, 
  isLoading,
  formData,
  updateFormData
}: { 
  post?: GeneralPost | null
  onSave: (data: { text: string; media: string[] }) => void
  onCancel: () => void
  isLoading: boolean
  formData: any
  updateFormData: (updates: any) => void
}) {
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form data when editing
  useEffect(() => {
    if (post) {
      updateFormData({
        text: post.text || '',
        media: post.media || []
      })
    }
  }, [post, updateFormData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.text?.trim()) return
    
    onSave({ text: formData.text.trim(), media: formData.media || [] })
  }

  const addMediaUrl = () => {
    if (newMediaUrl.trim() && !(formData.media || []).includes(newMediaUrl.trim())) {
      updateFormData({ media: [...(formData.media || []), newMediaUrl.trim()] })
      setNewMediaUrl('')
    }
  }

  const removeMediaUrl = (index: number) => {
    const currentMedia = formData.media || []
    updateFormData({ media: currentMedia.filter((_: string, i: number) => i !== index) })
  }

  // Handle file upload for images only
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file. For videos, use URL instead.')
      return
    }

    try {
      const uploadedUrl = await StorageService.uploadImage(file)
      updateFormData({ media: [...(formData.media || []), uploadedUrl] })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
    
    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          {post ? 'Edit Post' : 'Create New Post'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Content
          </label>
          <textarea
            value={formData.text || ''}
            onChange={(e) => updateFormData({ text: e.target.value })}
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
          {(formData.media || []).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Media files:</p>
              {(formData.media || []).map((url: string, index: number) => (
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
          <Button type="submit" disabled={isLoading || !formData.text?.trim()} className="w-full sm:w-auto">
            {isLoading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

// Media Display Component
function MediaDisplay({ media }: { media: string[] }) {
  if (!media || media.length === 0) {
    return <span className="text-gray-400">No media</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {media.slice(0, 3).map((url, index) => (
        <div key={index} className="flex items-center space-x-1">
          {isVideoUrl(url) ? (
            <Video className="h-4 w-4 text-blue-500" />
          ) : (
            <ImageIcon className="h-4 w-4 text-green-500" />
          )}
        </div>
      ))}
      {media.length > 3 && (
        <span className="text-xs text-gray-500">+{media.length - 3} more</span>
      )}
    </div>
  )
}
