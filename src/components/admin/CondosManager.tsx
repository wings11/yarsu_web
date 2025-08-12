'use client'

import React, { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { StorageService } from '@/lib/storage'
import { Trash2, Edit, Plus, MapPin, DollarSign, Home, Bed } from 'lucide-react'
import toast from 'react-hot-toast'

interface Condo {
  id: number
  title: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  floor: number
  size_sqm: number
  furnished: boolean
  balcony: boolean
  parking: boolean
  images: string[]
  notes?: string
  created_at: string
}

export default function CondosManager() {
  const [isEditing, setIsEditing] = useState(false)
  const [editingCondo, setEditingCondo] = useState<Condo | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    floor: 1,
    size_sqm: 0,
    furnished: false,
    balcony: false,
    parking: false,
    images: [''],
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch condos
  const { data: condos, isLoading, error } = useQuery({
    queryKey: ['condos'],
    queryFn: () => apiService.getCondos(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  })

  // Create condo mutation
  const createMutation = useMutation({
    mutationFn: (condoData: typeof formData) => 
      fetch('https://yarsu-backend.onrender.com/api/condos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(condoData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condos'] })
      resetForm()
      toast.success('Condo created successfully!')
    },
    onError: (error) => {
      console.error('Create condo error:', error)
      toast.error('Failed to create condo')
    }
  })

  // Delete condo mutation
  const deleteMutation = useMutation({
    mutationFn: (condoId: number) => 
      fetch(`https://yarsu-backend.onrender.com/api/condos/${condoId}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condos'] })
      toast.success('Condo deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete condo error:', error)
      toast.error('Failed to delete condo')
    }
  })

  // Update condo mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...condoData }: { id: number } & typeof formData) => 
      fetch(`https://yarsu-backend.onrender.com/api/condos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(condoData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condos'] })
      resetForm()
      toast.success('Condo updated successfully!')
    },
    onError: (error) => {
      console.error('Update condo error:', error)
      toast.error('Failed to update condo')
    }
  })

  const resetForm = () => {
    setFormData({
      title: '',
      address: '',
      price: 0,
      bedrooms: 1,
      bathrooms: 1,
      floor: 1,
      size_sqm: 0,
      furnished: false,
      balcony: false,
      parking: false,
      images: [''],
      notes: ''
    })
    setIsEditing(false)
    setEditingCondo(null)
  }

  const handleEdit = (condo: Condo) => {
    setEditingCondo(condo)
    setFormData({
      title: condo.title,
      address: condo.address,
      price: condo.price,
      bedrooms: condo.bedrooms,
      bathrooms: condo.bathrooms,
      floor: condo.floor,
      size_sqm: condo.size_sqm,
      furnished: condo.furnished,
      balcony: condo.balcony,
      parking: condo.parking,
      images: condo.images.length > 0 ? condo.images : [''],
      notes: condo.notes || ''
    })
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.address.trim() || formData.price <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const cleanedData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== '')
    }

    if (editingCondo) {
      updateMutation.mutate({ id: editingCondo.id, ...cleanedData })
    } else {
      createMutation.mutate(cleanedData)
    }
  }

  const handleDelete = (condoId: number) => {
    if (window.confirm('Are you sure you want to delete this condo?')) {
      deleteMutation.mutate(condoId)
    }
  }

  const addArrayField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    })
  }

  const updateArrayField = (index: number, value: string) => {
    const newArray = [...formData.images]
    newArray[index] = value
    setFormData({
      ...formData,
      images: newArray
    })
  }

  const removeArrayField = (index: number) => {
    const newArray = formData.images.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      images: newArray.length > 0 ? newArray : ['']
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
      const publicUrl = await StorageService.uploadImage(file, 'images', 'condos')
      
      // Update form data with the permanent URL
      updateArrayField(index, publicUrl)
      
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
  if (error) return <div className="text-red-600 p-4">Error loading condos</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Condos Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Condo</span>
        </button>
      </div>

      {/* Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingCondo ? 'Edit Condo' : 'Create New Condo'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter condo title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (THB) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Monthly rent"
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
                    placeholder="Condo address"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 1 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size (sqm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.size_sqm}
                      onChange={(e) => setFormData({ ...formData, size_sqm: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.furnished}
                      onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Furnished</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.balcony}
                      onChange={(e) => setFormData({ ...formData, balcony: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Balcony</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.parking}
                      onChange={(e) => setFormData({ ...formData, parking: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Parking</span>
                  </label>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condo Images
                  </label>
                  {formData.images.map((image, index) => (
                    <div key={index} className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => updateArrayField(index, e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Image URL or upload file below"
                        />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField(index)}
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
                            alt={`Condo preview ${index + 1}`}
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
                    onClick={addArrayField}
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
                    placeholder="Additional information about the condo"
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
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Condo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Condos List */}
      <div className="grid gap-4">
        {condos && condos.length > 0 ? (
          condos.map((condo: Condo) => (
            <div key={condo.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{condo.title || 'Untitled'}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{condo.address || 'No address'}</span>
                    </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>₿{condo.price?.toLocaleString() || 'N/A'}/month</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Bed className="h-4 w-4" />
                    <span>{condo.bedrooms || 0} bed, {condo.bathrooms || 0} bath</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Home className="h-4 w-4" />
                    <span>{condo.size_sqm || 'N/A'} sqm, Floor {condo.floor || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {condo.furnished && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Furnished
                    </span>
                  )}
                  {condo.balcony && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Balcony
                    </span>
                  )}
                  {condo.parking && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Parking
                    </span>
                  )}
                </div>

                {condo.notes && (
                  <p className="text-gray-600 text-sm">{condo.notes}</p>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(condo)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(condo.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {condos && condos.length === 0 ? 'No condos found. Create your first condo listing!' : 'Loading condos...'}
          </div>
        )}
      </div>
    </div>
  )
}
