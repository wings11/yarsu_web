'use client'

import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { Trash2, Edit, Plus, MapPin, DollarSign, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface Job {
  id: number
  title: string
  pinkcard: boolean
  thai: boolean
  payment_type: boolean // true = daily, false = monthly
  stay: boolean
  location: string
  job_location: string
  notes?: string
  created_at: string
}

export default function JobsManager() {
  const [isEditing, setIsEditing] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    pinkcard: false,
    thai: false,
    payment_type: true, // true = daily, false = monthly
    stay: false,
    location: '',
    job_location: '',
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch jobs
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiService.getJobs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create job mutation
  const createMutation = useMutation({
    mutationFn: (jobData: typeof formData) => apiService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      resetForm()
      toast.success('Job created successfully!')
    },
    onError: (error) => {
      console.error('Create job error:', error)
      toast.error('Failed to create job')
    }
  })

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: (jobId: number) => apiService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete job error:', error)
      toast.error('Failed to delete job')
    }
  })

  // Update job mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...jobData }: { id: number } & typeof formData) => 
      apiService.updateJob(id, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      resetForm()
      toast.success('Job updated successfully!')
    },
    onError: (error) => {
      console.error('Update job error:', error)
      toast.error('Failed to update job')
    }
  })

  const resetForm = () => {
    setFormData({
      title: '',
      pinkcard: false,
      thai: false,
      payment_type: true, // true = daily
      stay: false,
      location: '',
      job_location: '',
      notes: ''
    })
    setIsEditing(false)
    setEditingJob(null)
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      pinkcard: job.pinkcard,
      thai: job.thai,
      payment_type: job.payment_type,
      stay: job.stay,
      location: job.location,
      job_location: job.job_location,
      notes: job.notes || ''
    })
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.job_location.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.stay && !formData.location.trim()) {
      toast.error('Please specify accommodation location')
      return
    }

    // Clean the data before sending
    const cleanData = {
      title: formData.title.trim(),
      pinkcard: Boolean(formData.pinkcard),
      thai: Boolean(formData.thai),
      payment_type: formData.payment_type,
      stay: Boolean(formData.stay),
      location: formData.stay ? formData.location.trim() : '',
      job_location: formData.job_location.trim(),
      notes: formData.notes.trim() || ''
    }

    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, ...cleanData })
    } else {
      createMutation.mutate(cleanData)
    }
  }

  const handleDelete = (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteMutation.mutate(jobId)
    }
  }

  if (isLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  if (error) return <div className="text-red-600 p-4">Error loading jobs</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Jobs Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Job</span>
        </button>
      </div>

      {/* Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter job title"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Location *
                    </label>
                    <input
                      type="text"
                      value={formData.job_location}
                      onChange={(e) => setFormData({ ...formData, job_location: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Specific work location"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <select
                      value={formData.payment_type ? "daily" : "monthly"}
                      onChange={(e) => setFormData({ ...formData, payment_type: e.target.value === "daily" })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.pinkcard}
                      onChange={(e) => setFormData({ ...formData, pinkcard: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Pink Card Required</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.thai}
                      onChange={(e) => setFormData({ ...formData, thai: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Thai Language</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.stay}
                      onChange={(e) => setFormData({ ...formData, stay: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Accommodation Provided</span>
                  </label>
                </div>

                {formData.stay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accommodation Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Where is the accommodation located?"
                      required={formData.stay}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional information about the job"
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
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="grid gap-4">
        {jobs?.map((job: Job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{job.job_location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="capitalize">{job.payment_type ? 'Daily' : 'Monthly'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {job.pinkcard && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                      Pink Card Required
                    </span>
                  )}
                  {job.thai && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Thai Language
                    </span>
                  )}
                  {job.stay && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Accommodation Provided
                    </span>
                  )}
                </div>

                {job.notes && (
                  <p className="text-gray-600 text-sm">{job.notes}</p>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(job)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {jobs?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No jobs found. Create your first job posting!
          </div>
        )}
      </div>
    </div>
  )
}
