'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useDocs } from '@/hooks/useApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import VideoPlayer from '@/components/ui/VideoPlayer'
import { Calendar, Plus, Edit, Trash2, FileText, Video, Image as ImageIcon, X, ExternalLink, Upload } from 'lucide-react'
import type { Doc } from '@/lib/supabase'
import { apiService } from '@/lib/api'
import { isVideoUrl, isImageUrl, getVideoType } from '@/utils/mediaUtils'
import { StorageService } from '@/lib/storage'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { DraftNotification } from '@/components/ui/DraftNotification'

export default function DocsManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null)
  const { data: docs, isLoading } = useDocs()
  const queryClient = useQueryClient()

  // Create doc mutation
  const createDocMutation = useMutation({
    mutationFn: async (docData: { text: string; media: string[] }) => {
      return await apiService.createDoc(docData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs'] })
      setIsCreating(false)
    },
    onError: (error: any) => {
      console.error('Create doc error:', error)
      alert(`Failed to create document: ${error.message}`)
    }
  })

  // Delete doc mutation
  const deleteDocMutation = useMutation({
    mutationFn: async (docId: number) => {
      return await apiService.deleteDoc(docId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs'] })
    },
    onError: (error: any) => {
      console.error('Delete doc error:', error)
      alert(`Failed to delete document: ${error.message}`)
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-600">Manage important documents and guides</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Document</span>
        </Button>
      </div>

      {/* Create/Edit Doc Form */}
      {(isCreating || editingDoc) && (
        <DocForm
          doc={editingDoc}
          onSave={(docData) => {
            if (editingDoc) {
              // Update logic here
            } else {
              createDocMutation.mutate(docData)
            }
          }}
          onCancel={() => {
            setIsCreating(false)
            setEditingDoc(null)
          }}
          isLoading={createDocMutation.isPending}
        />
      )}

      {/* Documents List - Enhanced Row Layout */}
      <div className="space-y-4">
        {!docs || docs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by creating your first document.
            </p>
          </div>
        ) : (
          docs.map((doc: Doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Header with date and actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="h-4 w-4 mr-1" />
                  Document - {new Date(doc.created_at).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingDoc(doc)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this document?')) {
                        deleteDocMutation.mutate(doc.id)
                      }
                    }}
                    disabled={deleteDocMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Text content */}
                {doc.text && (
                  <div className="prose max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{doc.text}</p>
                  </div>
                )}

                {/* Media content */}
                {doc.media && doc.media.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                      Media Content ({doc.media.length} item{doc.media.length !== 1 ? 's' : ''})
                    </h4>
                    <div className="grid gap-4">
                      {doc.media.map((mediaUrl, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {isImageUrl(mediaUrl) ? (
                                <ImageIcon className="h-5 w-5 text-blue-500" />
                              ) : isVideoUrl(mediaUrl) ? (
                                <Video className="h-5 w-5 text-red-500" />
                              ) : (
                                <ExternalLink className="h-5 w-5 text-green-500" />
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
                                    className="hover:underline flex items-center space-x-1"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>{mediaUrl}</span>
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

// Document Form Component
function DocForm({ 
  doc, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  doc?: Doc | null
  onSave: (data: { text: string; media: string[] }) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [showDraftNotification, setShowDraftNotification] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultFormData = {
    text: '',
    mediaUrls: [] as string[]
  }

  const {
    formData,
    updateFormData,
    resetForm,
    clearDraft,
    hasUnsavedChanges,
    hasSavedDraft
  } = useFormPersistence({
    key: 'docs_form',
    defaultValues: defaultFormData,
    autoSave: true,
    autoSaveDelay: 2000
  })

  // Check for saved draft on component mount
  useEffect(() => {
    if (hasSavedDraft && !doc) {
      setShowDraftNotification(true)
    }
  }, [hasSavedDraft, doc])

  // Load doc data when editing
  useEffect(() => {
    if (doc) {
      updateFormData({
        text: doc.text,
        mediaUrls: doc.media || []
      })
      setShowDraftNotification(false)
    }
  }, [doc, updateFormData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.text.trim()) return
    onSave({ 
      text: formData.text.trim(), 
      media: formData.mediaUrls 
    })
    clearDraft() // Clear draft after successful save
  }

  const addMediaUrl = () => {
    if (newMediaUrl.trim() && !formData.mediaUrls.includes(newMediaUrl.trim())) {
      updateFormData({ mediaUrls: [...formData.mediaUrls, newMediaUrl.trim()] })
      setNewMediaUrl('')
    }
  }

  const removeMediaUrl = (index: number) => {
    updateFormData({ 
      mediaUrls: formData.mediaUrls.filter((_, i) => i !== index) 
    })
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
      updateFormData({ mediaUrls: [...formData.mediaUrls, uploadedUrl] })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
    
    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
        <span>{doc ? 'Edit Document' : 'Create New Document'}</span>
        {hasUnsavedChanges && !doc && (
          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
            Draft saved
          </span>
        )}
      </h3>
      
      {/* Draft Notification */}
      <DraftNotification
        isVisible={showDraftNotification}
        onRestore={() => setShowDraftNotification(false)}
        onDiscard={() => {
          clearDraft()
          setShowDraftNotification(false)
        }}
        formType="document"
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Content
          </label>
          <textarea
            value={formData.text}
            onChange={(e) => updateFormData({ text: e.target.value })}
            placeholder="Write your document content here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={8}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media URLs (Images/Videos)
          </label>
          
          {/* URL Input */}
          <div className="flex space-x-2 mb-2">
            <Input
              type="url"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="Enter image or video URL..."
              className="flex-1"
            />
            <Button type="button" onClick={addMediaUrl} variant="secondary">
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
          {formData.mediaUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Media files:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.mediaUrls.map((url: string, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <Video className="h-4 w-4 text-blue-500" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium">
                          {url.match(/\.(mp4|webm|ogg)$/i) ? 'Video' : 'Image'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMediaUrl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{url}</p>
                    
                    {/* Preview */}
                    {isVideoUrl(url) ? (
                      <VideoPlayer 
                        url={url}
                        className="w-full h-24 rounded mt-2"
                        isPreview={true}
                        showTitle={false}
                      />
                    ) : (
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded mt-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={isLoading || !formData.text.trim()}>
            {isLoading ? 'Saving...' : doc ? 'Update Document' : 'Create Document'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
