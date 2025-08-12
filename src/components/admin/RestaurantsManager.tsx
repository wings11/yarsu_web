'use client'

import React, { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { StorageService } from '@/lib/storage'
import { Trash2, Edit, Plus, MapPin, Star, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'

interface Restaurant {
  id: number
  name: string
  location: string
  images: string[]
  popular_picks: string[]
  admin_rating: number
  notes?: string
  created_at: string
}

export default function RestaurantsManager() {
  const [isEditing, setIsEditing] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    images: [''],
    popular_picks: [''],
    admin_rating: 5,
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch restaurants
  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => apiService.getRestaurants(),
    staleTime: 5 * 60 * 1000,
  })

  // Create restaurant mutation
  const createMutation = useMutation({
    mutationFn: (restaurantData: typeof formData) => 
      fetch('https://yarsu-backend.onrender.com/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      resetForm()
      toast.success('Restaurant created successfully!')
    },
    onError: (error) => {
      console.error('Create restaurant error:', error)
      toast.error('Failed to create restaurant')
    }
  })

  // Delete restaurant mutation
  const deleteMutation = useMutation({
    mutationFn: (restaurantId: number) => 
      fetch(`https://yarsu-backend.onrender.com/api/restaurants/${restaurantId}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      toast.success('Restaurant deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete restaurant error:', error)
      toast.error('Failed to delete restaurant')
    }
  })

  // Update restaurant mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...restaurantData }: { id: number } & typeof formData) => 
      fetch(`https://yarsu-backend.onrender.com/api/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      resetForm()
      toast.success('Restaurant updated successfully!')
    },
    onError: (error) => {
      console.error('Update restaurant error:', error)
      toast.error('Failed to update restaurant')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      images: [''],
      popular_picks: [''],
      admin_rating: 5,
      notes: ''
    })
    setIsEditing(false)
    setEditingRestaurant(null)
  }

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setFormData({
      name: restaurant.name,
      location: restaurant.location,
      images: restaurant.images.length > 0 ? restaurant.images : [''],
      popular_picks: restaurant.popular_picks.length > 0 ? restaurant.popular_picks : [''],
      admin_rating: restaurant.admin_rating,
      notes: restaurant.notes || ''
    })
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const cleanedData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== ''),
      popular_picks: formData.popular_picks.filter(pick => pick.trim() !== '')
    }

    if (editingRestaurant) {
      updateMutation.mutate({ id: editingRestaurant.id, ...cleanedData })
    } else {
      createMutation.mutate(cleanedData)
    }
  }

  const handleDelete = (restaurantId: number) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      deleteMutation.mutate(restaurantId)
    }
  }

  const addArrayField = (field: 'images' | 'popular_picks') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    })
  }

  const updateArrayField = (field: 'images' | 'popular_picks', index: number, value: string) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({
      ...formData,
      [field]: newArray
    })
  }

  const removeArrayField = (field: 'images' | 'popular_picks', index: number) => {
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

    try {
      toast.loading('Uploading image...')
      
      // Upload to Supabase storage and get permanent URL
      const publicUrl = await StorageService.uploadImage(file, 'images', 'restaurants')
      
      // Update form data with the permanent URL
      updateArrayField('images', index, publicUrl)
      
      toast.dismiss()
      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.dismiss()
      console.error('Image upload error:', error)
      toast.error('Failed to upload image. Please try again.')
    }
    
    // Clear the file input
    e.target.value = ''
  }

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  if (error) return <div className="text-red-600 p-4">Error loading restaurants</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Restaurants Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Restaurant</span>
        </button>
      </div>

      {/* Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingRestaurant ? 'Edit Restaurant' : 'Create New Restaurant'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter restaurant name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Restaurant location"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Rating (1-5)
                  </label>
                  <select
                    value={formData.admin_rating}
                    onChange={(e) => setFormData({ ...formData, admin_rating: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Popular Picks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popular Dishes
                  </label>
                  {formData.popular_picks.map((pick, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={pick}
                        onChange={(e) => updateArrayField('popular_picks', index, e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Popular dish name"
                      />
                      {formData.popular_picks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('popular_picks', index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('popular_picks')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Another Dish
                  </button>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Images
                  </label>
                  {formData.images.map((image, index) => (
                    <div key={index} className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
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
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
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
                            alt={`Restaurant preview ${index + 1}`}
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
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Another Image
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
                    placeholder="Additional information about the restaurant"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Restaurant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Restaurants List */}
      <div className="grid gap-4">
        {restaurants?.map((restaurant: Restaurant) => (
          <div key={restaurant.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                  <div className="flex items-center">
                    {[...Array(restaurant.admin_rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.location}</span>
                </div>

                {restaurant.popular_picks.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Popular Dishes:</strong> {restaurant.popular_picks.join(', ')}
                    </p>
                  </div>
                )}

                {restaurant.notes && (
                  <p className="text-gray-600 text-sm">{restaurant.notes}</p>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(restaurant)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(restaurant.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {restaurants?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No restaurants found. Create your first restaurant listing!
          </div>
        )}
      </div>
    </div>
  )
}
