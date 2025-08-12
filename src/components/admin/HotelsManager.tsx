'use client'

import React, { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { StorageService } from '@/lib/storage'
import { Trash2, Edit, Plus, MapPin, Star, Wifi, Coffee, Waves, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

interface Hotel {
  id: number
  name: string
  address: string
  price: number
  nearby_famous_places: string[]
  breakfast: boolean
  free_wifi: boolean
  swimming_pool: boolean
  images: string[]
  notes?: string
  admin_rating: number
  created_at: string
}

export default function HotelsManager() {
  const [isEditing, setIsEditing] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    price: 0,
    nearby_famous_places: [''],
    breakfast: false,
    free_wifi: false,
    swimming_pool: false,
    images: [''],
    notes: '',
    admin_rating: 5
  })

  const queryClient = useQueryClient()

  // Fetch hotels
  const { data: hotels, isLoading, error } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => apiService.getHotels(),
    staleTime: 5 * 60 * 1000,
  })

  // Create hotel mutation
  const createMutation = useMutation({
    mutationFn: (hotelData: typeof formData) => 
      fetch('https://yarsu-backend.onrender.com/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
      resetForm()
      toast.success('Hotel created successfully!')
    },
    onError: (error) => {
      console.error('Create hotel error:', error)
      toast.error('Failed to create hotel')
    }
  })

  // Delete hotel mutation
  const deleteMutation = useMutation({
    mutationFn: (hotelId: number) => 
      fetch(`https://yarsu-backend.onrender.com/api/hotels/${hotelId}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
      toast.success('Hotel deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete hotel error:', error)
      toast.error('Failed to delete hotel')
    }
  })

  // Update hotel mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...hotelData }: { id: number } & typeof formData) => 
      fetch(`https://yarsu-backend.onrender.com/api/hotels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
      resetForm()
      toast.success('Hotel updated successfully!')
    },
    onError: (error) => {
      console.error('Update hotel error:', error)
      toast.error('Failed to update hotel')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      price: 0,
      nearby_famous_places: [''],
      breakfast: false,
      free_wifi: false,
      swimming_pool: false,
      images: [''],
      notes: '',
      admin_rating: 5
    })
    setIsEditing(false)
    setEditingHotel(null)
  }

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setFormData({
      name: hotel.name,
      address: hotel.address,
      price: hotel.price,
      nearby_famous_places: hotel.nearby_famous_places.length > 0 ? hotel.nearby_famous_places : [''],
      breakfast: hotel.breakfast,
      free_wifi: hotel.free_wifi,
      swimming_pool: hotel.swimming_pool,
      images: hotel.images.length > 0 ? hotel.images : [''],
      notes: hotel.notes || '',
      admin_rating: hotel.admin_rating
    })
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.address.trim() || formData.price <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const cleanedData = {
      ...formData,
      nearby_famous_places: formData.nearby_famous_places.filter(place => place.trim() !== ''),
      images: formData.images.filter(img => img.trim() !== '')
    }

    if (editingHotel) {
      updateMutation.mutate({ id: editingHotel.id, ...cleanedData })
    } else {
      createMutation.mutate(cleanedData)
    }
  }

  const handleDelete = (hotelId: number) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      deleteMutation.mutate(hotelId)
    }
  }

  const addArrayField = (field: 'nearby_famous_places' | 'images') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    })
  }

  const updateArrayField = (field: 'nearby_famous_places' | 'images', index: number, value: string) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({
      ...formData,
      [field]: newArray
    })
  }

  const removeArrayField = (field: 'nearby_famous_places' | 'images', index: number) => {
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
      const publicUrl = await StorageService.uploadImage(file, 'images', 'hotels')
      
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
  if (error) return <div className="text-red-600 p-4">Error loading hotels</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Hotels Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Hotel</span>
        </button>
      </div>

      {/* Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingHotel ? 'Edit Hotel' : 'Create New Hotel'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hotel Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter hotel name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Night (THB) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hotel address"
                    required
                  />
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

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.breakfast}
                      onChange={(e) => setFormData({ ...formData, breakfast: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Breakfast Included</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.free_wifi}
                      onChange={(e) => setFormData({ ...formData, free_wifi: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Free WiFi</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.swimming_pool}
                      onChange={(e) => setFormData({ ...formData, swimming_pool: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Swimming Pool</span>
                  </label>
                </div>

                {/* Famous Places */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nearby Famous Places
                  </label>
                  {formData.nearby_famous_places.map((place, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={place}
                        onChange={(e) => updateArrayField('nearby_famous_places', index, e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Famous place name"
                      />
                      {formData.nearby_famous_places.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('nearby_famous_places', index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('nearby_famous_places')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Another Place
                  </button>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Images
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
                            alt={`Hotel preview ${index + 1}`}
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
                    placeholder="Additional information about the hotel"
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
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Hotel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hotels List */}
      <div className="grid gap-4">
        {hotels?.map((hotel: Hotel) => (
          <div key={hotel.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                  <div className="flex items-center">
                    {[...Array(hotel.admin_rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{hotel.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-semibold">₿{hotel.price}</span>
                    <span>per night</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {hotel.breakfast && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
                      <Coffee className="h-3 w-3" />
                      <span>Breakfast</span>
                    </span>
                  )}
                  {hotel.free_wifi && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center space-x-1">
                      <Wifi className="h-3 w-3" />
                      <span>Free WiFi</span>
                    </span>
                  )}
                  {hotel.swimming_pool && (
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full flex items-center space-x-1">
                      <Waves className="h-3 w-3" />
                      <span>Pool</span>
                    </span>
                  )}
                </div>

                {hotel.nearby_famous_places.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Nearby:</strong> {hotel.nearby_famous_places.join(', ')}
                    </p>
                  </div>
                )}

                {hotel.notes && (
                  <p className="text-gray-600 text-sm">{hotel.notes}</p>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(hotel)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {hotels?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hotels found. Create your first hotel listing!
          </div>
        )}
      </div>
    </div>
  )
}
