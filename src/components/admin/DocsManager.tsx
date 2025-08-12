'use client'

import React, { useState, useRef } from 'react'
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs?.map((doc: Doc) => (
          <div key={doc.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <span className="text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDoc(doc)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDocMutation.mutate(doc.id)}
                    disabled={deleteDocMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-900 text-sm line-clamp-4 whitespace-pre-wrap">
                  {doc.text}
                </p>
              </div>
              
              {/* Media Count */}
              {doc.media && doc.media.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                     <ImageIcon className="h-4 w-4" />
                    <span>{doc.media.filter(url => isImageUrl(url)).length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Video className="h-4 w-4" />
                    <span>{doc.media.filter(url => isVideoUrl(url)).length}</span>
                  </div>
                </div>
              )}
              
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  // Open document in modal or navigate to detail view
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Document
              </Button>
            </div>
          </div>
        ))}
      </div>

      {(!docs || docs.length === 0) && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by creating your first document.
          </p>
        </div>
      )}
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
  const [text, setText] = useState(doc?.text || '')
  const [mediaUrls, setMediaUrls] = useState<string[]>(doc?.media || [])
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onSave({ 
      text: text.trim(), 
      media: mediaUrls 
    })
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

    try {
      const uploadedUrl = await StorageService.uploadImage(file)
      setMediaUrls([...mediaUrls, uploadedUrl])
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
    
    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">
        {doc ? 'Edit Document' : 'Create New Document'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
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
          {mediaUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Media files:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mediaUrls.map((url, index) => (
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
          <Button type="submit" disabled={isLoading || !text.trim()}>
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
