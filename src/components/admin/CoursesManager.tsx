'use client'

import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { SmartLink } from '@/components/ui/SmartLink'
import { Trash2, Edit, Plus, MapPin, DollarSign, GraduationCap, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface Course {
  id: number
  name: string
  duration: string
  price: number
  centre_name: string
  location: string
  notes?: string
  created_at: string
}

export default function CoursesManager() {
  const [isEditing, setIsEditing] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  
  const defaultFormData = {
    name: '',
    duration: '',
    price: 0,
    centre_name: '',
    location: '',
    notes: ''
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
    key: 'courses-form',
    defaultValues: defaultFormData,
    autoSave: true,
    autoSaveDelay: 2000
  })

  const queryClient = useQueryClient()

  // Fetch courses
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiService.getCourses(),
    staleTime: 5 * 60 * 1000,
  })

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: (courseData: typeof formData) => apiService.createCourse(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      resetForm()
      toast.success('Course created successfully!')
    },
    onError: (error) => {
      console.error('Create course error:', error)
      toast.error('Failed to create course')
    }
  })

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...courseData }: { id: number } & typeof formData) => apiService.updateCourse(id, courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      resetForm()
      toast.success('Course updated successfully!')
    },
    onError: (error) => {
      console.error('Update course error:', error)
      toast.error('Failed to update course')
    }
  })

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: (courseId: number) => apiService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Course deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete course error:', error)
      toast.error('Failed to delete course')
    }
  })

  const resetForm = () => {
    resetFormPersistence()
    setIsEditing(false)
    setEditingCourse(null)
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    updateFormData({
      name: course.name,
      duration: course.duration,
      price: course.price,
      centre_name: course.centre_name,
      location: course.location,
      notes: course.notes || ''
    })
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.centre_name.trim() || formData.price < 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const cleanedData = {
      name: formData.name.trim(),
      duration: formData.duration.trim(),
      price: formData.price,
      centre_name: formData.centre_name.trim(),
      location: formData.location.trim(),
      notes: formData.notes.trim()
    }

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, ...cleanedData })
    } else {
      createMutation.mutate(cleanedData)
    }
  }

  const handleDelete = (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(courseId)
    }
  }

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  if (error) return <div className="text-red-600 p-4">Error loading courses</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Courses Management</h2>
        <button
          onClick={() => {
            resetForm()
            setIsEditing(true)
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Course Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditingCourse(null)
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
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Centre Name *
                  </label>
                  <input
                    type="text"
                    value={formData.centre_name}
                    onChange={(e) => updateFormData({ centre_name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Centre name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (THB)
                  </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price === 0 ? '' : formData.price}
                      onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Course price"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => updateFormData({ duration: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 8 weeks, 3 months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateFormData({ location: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Course location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the course"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setEditingCourse(null)
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
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="grid gap-4">
        {courses?.map((course: Course) => (
          <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>{course.centre_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>₿{course.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SmartLink 
                      text={course.location} 
                      iconType="location"
                      className="text-sm"
                      fallbackText="Location TBA"
                    />
                  </div>
                </div>

                {course.notes && (
                  <p className="text-gray-600 text-sm mb-3">{course.notes}</p>
                )}

                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created: {new Date(course.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(course)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit course"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete course"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {courses?.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500">Start by adding your first course.</p>
          </div>
        )}
      </div>
    </div>
  )
}
