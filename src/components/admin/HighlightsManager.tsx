'use client'

import React, { useState, useRef } from 'react'
import { useHighlights } from '@/hooks/useApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Calendar, Plus, Edit, Trash2, Star, Upload } from 'lucide-react'
import type { Highlight } from '@/lib/supabase'
import { StorageService } from '@/lib/storage'
import { apiService } from '@/lib/api'
import toast from 'react-hot-toast'

export default function HighlightsManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null)
  const { data: highlights, isLoading } = useHighlights()
  const queryClient = useQueryClient()

  const defaultFormData = {
    image: ''
  }

  const {
    formData,
    updateFormData,
    resetForm: resetFormPersistence,
    clearDraft,
    saveDraft,
    hasUnsavedChanges,
    hasSavedDraft
  } = useFormPersistence({
    key: 'highlights-form',
    defaultValues: defaultFormData,
    autoSave: true,
    autoSaveDelay: 2000
  })

  // Create highlight mutation
  const createHighlightMutation = useMutation({
    mutationFn: (highlightData: { image: string }) => apiService.createHighlight(highlightData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] })
      resetForm()
      toast.success('Highlight created successfully!')
    },
    onError: (error) => {
      console.error('Create highlight error:', error)
      toast.error('Failed to create highlight')
    }
  })

  // Update highlight mutation
  const updateHighlightMutation = useMutation({
    mutationFn: ({ id, ...highlightData }: { id: number } & typeof formData) => apiService.updateHighlight(id, highlightData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] })
      resetForm()
      toast.success('Highlight updated successfully!')
    },
    onError: (error) => {
      console.error('Update highlight error:', error)
      toast.error('Failed to update highlight')
    }
  })

  // Delete highlight mutation
  const deleteHighlightMutation = useMutation({
    mutationFn: (highlightId: number) => apiService.deleteHighlight(highlightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] })
      toast.success('Highlight deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete highlight error:', error)
      toast.error('Failed to delete highlight')
    }
  })

  const resetForm = () => {
    resetFormPersistence()
    setIsCreating(false)
    setEditingHighlight(null)
  }

  const handleEdit = (highlight: Highlight) => {
    setEditingHighlight(highlight)
    updateFormData({
      image: highlight.image
    })
    setIsCreating(true)
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Highlights Management</h2>
          <p className="text-gray-600">Manage homepage slideshow images</p>
          <div className="mt-1 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-1 inline-block">
            ⚡ Superadmin Only
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Highlight</span>
        </Button>
      </div>

      {/* Create/Edit Highlight Form */}
      {(isCreating || editingHighlight) && (
        <HighlightForm
          highlight={editingHighlight}
          onSave={(image) => {
            if (editingHighlight) {
              updateHighlightMutation.mutate({ id: editingHighlight.id, image })
            } else {
              createHighlightMutation.mutate({ image })
            }
          }}
          onCancel={() => {
            setIsCreating(false)
            setEditingHighlight(null)
          }}
          isLoading={createHighlightMutation.isPending || updateHighlightMutation.isPending}
        />
      )}

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights?.map((highlight: Highlight) => (
          <div key={highlight.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
            <div className="aspect-video relative">
              <img
                src={highlight.image}
                alt="Highlight"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg'
                }}
              />
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Highlight
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">
                  {new Date(highlight.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingHighlight(highlight)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHighlightMutation.mutate(highlight.id)}
                    disabled={deleteHighlightMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {highlight.image}
              </p>
            </div>
          </div>
        ))}
      </div>

      {(!highlights || highlights.length === 0) && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No highlights yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first highlight for the homepage slideshow.
          </p>
        </div>
      )}
    </div>
  )
}

// Highlight Form Component
function HighlightForm({ 
  highlight, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  highlight?: Highlight | null
  onSave: (image: string) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [imageUrl, setImageUrl] = useState(highlight?.image || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update form data helper
  const updateFormData = (field: string, value: string) => {
    if (field === 'imageUrl') {
      setImageUrl(value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl.trim()) return
    
    // Basic URL validation
    try {
      new URL(imageUrl)
    } catch {
      alert('Please enter a valid image URL')
      return
    }

    onSave(imageUrl.trim())
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    try {
      const uploadedUrl = await StorageService.uploadImage(file)
      updateFormData('imageUrl', uploadedUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Star className="h-5 w-5 text-yellow-600 fill-current" />
        <h3 className="text-lg font-medium">
          {highlight ? 'Edit Highlight' : 'Create New Highlight'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL *
          </label>
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => updateFormData('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or Upload Image File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
          />
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="bg-white border border-gray-200 rounded-md p-3">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        <div className="flex space-x-3">
          <Button type="submit" disabled={isLoading || !imageUrl.trim()}>
            {isLoading ? 'Saving...' : highlight ? 'Update Highlight' : 'Create Highlight'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
