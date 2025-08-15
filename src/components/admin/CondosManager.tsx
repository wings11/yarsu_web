'use client'

import React, { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { StorageService } from '@/lib/storage'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { Trash2, Edit, Plus, MapPin, DollarSign, Home, Bed } from 'lucide-react'
import toast from 'react-hot-toast'

interface Condo {
  id: number
  name: string
  address: string
  rent_fee: number
  images: string[]
  swimming_pool: boolean
  free_wifi: boolean
  gym: boolean
  garden: boolean
  co_working_space: boolean
  notes?: string
  created_at: string
}

export default function CondosManager() {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [editingCondo, setEditingCondo] = useState<Condo | null>(null)
  
  const defaultFormData = {
    name: '',
    address: '',
    rent_fee: 0,
    images: [''],
    swimming_pool: false,
    free_wifi: false,
    gym: false,
    garden: false,
    co_working_space: false,
    notes: ''
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
    key: 'condos-form',
    defaultValues: defaultFormData,
    autoSave: true,
    autoSaveDelay: 2000
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
      clearDraft()
      toast.success(t('condoCreatedSuccessfully') || 'Condo created successfully!')
    },
    onError: (error) => {
      console.error('Create condo error:', error)
      toast.error(t('failedToCreateCondo') || 'Failed to create condo')
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
      toast.success(t('condoDeletedSuccessfully') || 'Condo deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete condo error:', error)
      toast.error(t('failedToDeleteCondo') || 'Failed to delete condo')
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
      clearDraft()
      toast.success(t('condoUpdatedSuccessfully') || 'Condo updated successfully!')
    },
    onError: (error) => {
      console.error('Update condo error:', error)
      toast.error(t('failedToUpdateCondo') || 'Failed to update condo')
    }
  })

  const resetForm = () => {
    resetFormPersistence()
    setIsEditing(false)
    setEditingCondo(null)
  }

  const handleEdit = (condo: Condo) => {
    setEditingCondo(condo)
    updateFormData({
      name: condo.name,
      address: condo.address,
      rent_fee: condo.rent_fee,
      swimming_pool: condo.swimming_pool,
      free_wifi: condo.free_wifi,
      gym: condo.gym,
      garden: condo.garden,
      co_working_space: condo.co_working_space,
      images: condo.images.length > 0 ? condo.images : [''],
      notes: condo.notes || ''
    })
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.address.trim() || formData.rent_fee <= 0) {
      toast.error(t('fillRequiredFields') || 'Please fill in all required fields')
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
    if (window.confirm(t('confirmDeleteCondo') || 'Are you sure you want to delete this condo?')) {
      deleteMutation.mutate(condoId)
    }
  }

  const addArrayField = () => {
    updateFormData({
      images: [...formData.images, '']
    })
  }

  const updateArrayField = (index: number, value: string) => {
    const newArray = [...formData.images]
    newArray[index] = value
    updateFormData({
      images: newArray
    })
  }

  const removeArrayField = (index: number) => {
    const newArray = formData.images.filter((_, i) => i !== index)
    updateFormData({
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
        <h2 className="text-2xl font-bold text-gray-900">{t('condosManagement') || 'Condos Management'}</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{t('addCondo') || 'Add Condo'}</span>
        </button>
      </div>

      {/* Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingCondo ? (t('editCondo') || 'Edit Condo') : (t('createNewCondo') || 'Create New Condo')}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    {t('basicInformation') || 'Basic Information'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('condoName') || 'Condo Name'} *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('enterCondoName') || 'Enter condo name'}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('monthlyRent') || 'Monthly Rent (THB)'} *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">₿</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.rent_fee === 0 ? '' : formData.rent_fee}
                          onChange={(e) => updateFormData({ rent_fee: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('address') || 'Address'} *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateFormData({ address: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('condoAddress') || 'Condo address'}
                      required
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    {t('amenities') || 'Amenities'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.swimming_pool}
                        onChange={(e) => updateFormData({ swimming_pool: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{t('swimmingPool') || 'Swimming Pool'}</span>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.free_wifi}
                        onChange={(e) => updateFormData({ free_wifi: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{t('freeWifi') || 'Free WiFi'}</span>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.gym}
                        onChange={(e) => updateFormData({ gym: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{t('gym') || 'Gym'}</span>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.garden}
                        onChange={(e) => updateFormData({ garden: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{t('garden') || 'Garden'}</span>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.co_working_space}
                        onChange={(e) => updateFormData({ co_working_space: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{t('coWorkingSpace') || 'Co-working Space'}</span>
                    </label>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('images') || 'Images'}
                  </h4>
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
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Another Image
                  </button>
                </div>

                {/* Notes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {t('notes') || 'Notes'}
                  </h4>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    placeholder={t('additionalInfo') || 'Additional information about the condo'}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {t('cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? (t('saving') || 'Saving...') 
                      : (t('saveCondo') || 'Save Condo')
                    }
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{condo.name || 'Untitled'}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{condo.address || 'No address'}</span>
                    </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>₿{condo.rent_fee?.toLocaleString() || 'N/A'}/month</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {condo.swimming_pool && (
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">
                      Pool
                    </span>
                  )}
                  {condo.free_wifi && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      WiFi
                    </span>
                  )}
                  {condo.gym && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Gym
                    </span>
                  )}
                  {condo.garden && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                      Garden
                    </span>
                  )}
                  {condo.co_working_space && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Co-working
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
