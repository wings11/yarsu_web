'use client'

import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { SmartLink } from '@/components/ui/SmartLink'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { Trash2, Edit, Plus, MapPin, DollarSign, Users, Calendar, Star } from 'lucide-react'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import toast from 'react-hot-toast'
import EnhancedTable from './EnhancedTable'

interface Job {
  id: number
  job_num?: string
  media?: string[]
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
  
  const defaultFormData: {
    job_num: string;
    title: string;
    pinkcard: boolean;
    thai: boolean;
    payment_type: boolean;
    stay: boolean;
    location: string;
    job_location: string;
    notes: string;
    media: string[];
  } = {
    job_num: '',
    title: '',
    pinkcard: false,
    thai: false,
    payment_type: true, // true = daily, false = monthly
    stay: false,
    location: '',
    job_location: '',
    notes: '',
    media: []
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
    key: 'jobs-form',
    defaultValues: defaultFormData,
    autoSave: true,
    autoSaveDelay: 2000
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
      clearDraft() // Clear the saved draft
      toast.success('Job updated successfully!')
    },
    onError: (error) => {
      console.error('Update job error:', error)
      toast.error('Failed to update job')
    }
  })

  const resetForm = () => {
    resetFormPersistence()
    setIsEditing(false)
    setEditingJob(null)
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    updateFormData({
      job_num: job.job_num || '',
      title: job.title,
      pinkcard: job.pinkcard,
      thai: job.thai,
      payment_type: job.payment_type,
      stay: job.stay,
      location: job.location,
      job_location: job.job_location,
      notes: job.notes || '',
      media: job.media || []
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
  job_num: formData.job_num?.trim() || '',
  title: formData.title.trim(),
  pinkcard: Boolean(formData.pinkcard),
  thai: Boolean(formData.thai),
  payment_type: formData.payment_type,
  stay: Boolean(formData.stay),
  location: formData.stay ? formData.location.trim() : '',
  job_location: formData.job_location.trim(),
  notes: formData.notes.trim() || '',
  media: Array.isArray(formData.media) ? formData.media : []
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
        <h2 className="text-2xl font-bold text-gray-900">အလုပ်အကိုင် စီမံခန့်ခွဲရန်</h2>
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
                {editingJob ? 'ပြင်ပါ' : 'အလုပ်အကိုင်အသစ်ထည့်မယ်'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      အလုပ်နံပါတ် (Job Number)
                    </label>
                    <input
                      type="text"
                      value={formData.job_num}
                      onChange={(e) => updateFormData({ job_num: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Job Number (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      အလုပ်အမည် *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData({ title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter job title"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                     အလုပ်နေရာ *
                    </label>
                    <input
                      type="text"
                      value={formData.job_location}
                      onChange={(e) => updateFormData({ job_location: e.target.value })}
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
                      onChange={(e) => updateFormData({ payment_type: e.target.value === "daily" })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">နေ့ပြတ်</option>
                      <option value="monthly">လစဉ်</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.pinkcard}
                      onChange={(e) => updateFormData({ pinkcard: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">အထောက်အထား</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.thai}
                      onChange={(e) => updateFormData({ thai: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">ထိုင်းစကားတတ်ရန်လိုသည်</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.stay}
                      onChange={(e) => updateFormData({ stay: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">နေစရာ ပေးသည်</span>
                  </label>
                </div>

                {formData.stay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      နေစရာ နေရာ *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateFormData({ location: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="နေစရာနေရန်ပေးပါက ဖြည့်ပါ"
                      required={formData.stay}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    မှတ်ချက်
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional information about the job"
                  />
                </div>

                {/* Media input section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Media (images/videos/links)</label>
                  <div className="space-y-2">
                    {/* URL input for media */}
                    {formData.media.map((url: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={url}
                          onChange={e => {
                            const newMedia = [...formData.media]
                            newMedia[index] = e.target.value
                            updateFormData({ media: newMedia })
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded"
                          placeholder="Paste image/video/link URL"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newMedia = formData.media.filter((_, i) => i !== index)
                            updateFormData({ media: newMedia })
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateFormData({ media: [...formData.media, ''] })}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Media
                    </button>
                  </div>
                  {/* File upload for images/videos */}
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-2">Or upload image/video file:</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        let fileType: 'image' | 'video' = 'image';
                        if (file.type.startsWith('video/')) fileType = 'video';
                        try {
                          // @ts-ignore
                          const { StorageService } = await import('../../lib/storage');
                          const uploadedUrl = await StorageService.uploadFile(file, 'images', undefined, fileType);
                          updateFormData({ media: [...formData.media, uploadedUrl] });
                        } catch (error) {
                          alert('Failed to upload file. Please try again.');
                        }
                        e.target.value = '';
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Note: File upload supports images and videos. For YouTube/Vimeo, use the URL field above.</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    မလုပ်တော့ပါ
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

      {/* Enhanced Jobs Table */}
      <EnhancedTable
        data={jobs || []}
        columns={[
          {
            key: 'title',
            header: 'Job Title',
            sortable: true,
            render: (job: Job) => (
              <div className="min-w-0">
                <div className="font-medium text-gray-900 break-words">
                  {job.job_num ? <span className="text-blue-600 mr-2">[{job.job_num}]</span> : null}
                  {job.title}
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-1 break-words">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  {job.job_location}
                </div>
                {job.notes && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2 break-words">
                    {job.notes}
                  </div>
                )}
                {/* Media preview */}
                {job.media && job.media.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.media.map((url, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        {url && url.match(/(youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm|\.ogg|\.mov|\.avi)/i) ? (
                          <VideoPlayer url={url} className="w-32 h-20" isPreview={true} showTitle={false} />
                        ) : url && url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                          <img src={url} alt="Media" className="w-20 h-20 object-cover rounded border" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'payment_type',
            header: 'Payment',
            sortable: true,
            render: (job: Job) => (
              <div className="flex items-center text-sm whitespace-nowrap">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <span className="capitalize">{job.payment_type ? 'Daily' : 'Monthly'}</span>
              </div>
            ),
            desktopOnly: true
          },
          {
            key: 'requirements',
            header: 'Requirements',
            render: (job: Job) => (
              <div className="flex flex-wrap gap-1">
                {job.pinkcard && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full whitespace-nowrap">
                    Pink Card
                  </span>
                )}
                {job.thai && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                    Thai
                  </span>
                )}
                {job.stay && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap">
                    Stay
                  </span>
                )}
              </div>
            ),
            desktopOnly: true
          },
          {
            key: 'created_at',
            header: 'Created',
            sortable: true,
            render: (job: Job) => (
              <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(job.created_at).toLocaleDateString()}
              </div>
            ),
            desktopOnly: true
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (job: Job) => (
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(job)
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit job"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(job.id)
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete job"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          }
        ]}
        searchable={true}
        searchPlaceholder="Search jobs by title or location..."
        searchFields={['title', 'job_location', 'notes']}
        itemsPerPage={10}
        loading={isLoading}
        emptyMessage="No jobs found. Create your first job posting!"
        onRowClick={(job) => {
          // Optional: could open a detail view or expand row
          console.log('Clicked job:', job.title)
        }}
      />
    </div>
  )
}
