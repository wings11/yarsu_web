'use client'

import React, { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { Trash2, Edit, Plus, MapPin, Calendar, Plane, DollarSign, Star } from 'lucide-react'
import toast from 'react-hot-toast'

interface TravelPost {
  id: number
  name: string
  place: string
  highlights: string[]
  images: string[]
  admin_rating: number
  notes?: string
  created_at: string
}

export default function TravelManager() {
  const [isEditing, setIsEditing] = useState(false)
  const [editingTravel, setEditingTravel] = useState<TravelPost | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    place: '',
    highlights: [''],
    images: [''],
    admin_rating: 5,
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch travel posts
  const { data: travelPosts, isLoading, error } = useQuery({
    queryKey: ['travel-posts'],
    queryFn: () => apiService.getTravelPosts(),
    staleTime: 5 * 60 * 1000,
  })

  // Create travel post mutation
  const createMutation = useMutation({
    mutationFn: (travelData: typeof formData) => apiService.createTravelPost(travelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-posts'] })
      resetForm()
      toast.success('Travel post created successfully!')
    },
    onError: (error) => {
      console.error('Create travel post error:', error)
      toast.error('Failed to create travel post')
    }
  })

  // Update travel post mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...travelData }: { id: number } & typeof formData) => apiService.updateTravelPost(id, travelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-posts'] })
      resetForm()
      toast.success('Travel post updated successfully!')
    },
    onError: (error) => {
      console.error('Update travel post error:', error)
      toast.error('Failed to update travel post')
    }
  })

  // Delete travel post mutation
  const deleteMutation = useMutation({
    mutationFn: (travelId: number) => apiService.deleteTravelPost(travelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-posts'] })
      toast.success('Travel post deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete travel post error:', error)
      toast.error('Failed to delete travel post')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      place: '',
      highlights: [''],
      images: [''],
      admin_rating: 5,
      notes: ''
    })
    setIsEditing(false)
    setEditingTravel(null)
  }

  const handleEdit = (travel: TravelPost) => {
    setEditingTravel(travel)
    setFormData({
      name: travel.name,
      place: travel.place,
      highlights: travel.highlights && travel.highlights.length > 0 ? travel.highlights : [''],
      images: travel.images && travel.images.length > 0 ? travel.images : [''],
      admin_rating: travel.admin_rating,
      notes: travel.notes || ''
    })
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.place.trim() || formData.admin_rating < 1 || formData.admin_rating > 5) {
      toast.error('Please fill in all required fields and ensure admin rating is between 1-5')
      return
    }

    const cleanedData = {
      name: formData.name.trim(),
      place: formData.place.trim(),
      highlights: formData.highlights.filter(item => item.trim() !== ''),
      images: formData.images.filter(img => img.trim() !== ''),
      admin_rating: formData.admin_rating,
      notes: formData.notes.trim()
    }

    if (editingTravel) {
      updateMutation.mutate({ id: editingTravel.id, ...cleanedData })
    } else {
      createMutation.mutate(cleanedData)
    }
  }

  const addArrayField = (field: 'highlights' | 'images') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    })
  }

  const updateArrayField = (field: 'highlights' | 'images', index: number, value: string) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({
      ...formData,
      [field]: newArray
    })
  }

  const removeArrayField = (field: 'highlights' | 'images', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    setFormData({
      ...formData,
      [field]: newArray.length > 0 ? newArray : ['']
    })
  }

  // Handle image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // For demo: just use local URL. In production, upload to server/storage and get public URL.
    const url = URL.createObjectURL(file)
    updateArrayField('images', index, url)
    
    // Clear the file input
    e.target.value = ''
  }

  const handleDelete = (travelId: number) => {
    if (window.confirm('Are you sure you want to delete this travel post?')) {
      deleteMutation.mutate(travelId)
    }
  }

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  if (error) return <div className="text-red-600 p-4">Error loading travel posts</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Travel Posts Management</h2>
        <button
          onClick={() => {
            resetForm()
            setIsEditing(true)
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Travel Post</span>
        </button>
      </div>

      {/* Travel Post Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTravel ? 'Edit Travel Post' : 'Add New Travel Post'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditingTravel(null)
                  resetForm()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter travel name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Place *
                  </label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Destination place"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Rating * (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.admin_rating}
                  onChange={(e) => setFormData({ ...formData, admin_rating: parseInt(e.target.value) || 5 })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlights
                </label>
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateArrayField('highlights', index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter highlight"
                    />
                    {formData.highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('highlights', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('highlights')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Highlight
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                {formData.images.map((image, index) => (
                  <div key={index} className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => updateArrayField('images', index, e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Image URL or upload file below"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('images', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {/* File Upload Option */}
                    <div className="ml-4">
                      <label className="block text-xs text-gray-600 mb-1">
                        Or upload image file:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    
                    {/* Image Preview */}
                    {image && (
                      <div className="ml-4">
                        <img
                          src={image}
                          alt={`Travel preview ${index + 1}`}
                          className="w-24 h-16 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('images')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Image
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the travel post"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setEditingTravel(null)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingTravel ? 'Update Travel Post' : 'Create Travel Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Travel Posts List */}
      <div className="grid gap-4">
        {travelPosts?.map((travel: TravelPost) => (
          <div key={travel.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{travel.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{travel.admin_rating}/5</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{travel.place}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Plane className="h-4 w-4" />
                    <span>Travel Post</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(travel.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {travel.highlights && travel.highlights.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Highlights:</strong> {travel.highlights.join(', ')}
                    </p>
                  </div>
                )}

                {travel.notes && (
                  <p className="text-gray-600 text-sm mb-3">{travel.notes}</p>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(travel)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit travel post"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(travel.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete travel post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {travelPosts?.length === 0 && (
          <div className="text-center py-12">
            <Plane className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No travel posts yet</h3>
            <p className="text-gray-500">Start by adding your first travel post.</p>
          </div>
        )}
      </div>
    </div>
  )
}
