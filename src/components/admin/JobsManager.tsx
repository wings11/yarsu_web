'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { SmartLink } from '@/components/ui/SmartLink'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { Trash2, Edit, Plus, MapPin, DollarSign, Users, Calendar, Star, Coffee } from 'lucide-react'
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
  // new fields
  job_date?: string
  payment?: string | null
  pay_amount?: string | number | null
  accept_amount?: string | number | null
  treat?: boolean
  accept?: string | null
  stay: boolean
  location: string
  job_location: string
  notes?: string
  created_at: string
}

export default function JobsManager() {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const defaultFormData: {
    job_num: string;
    title: string;
    pinkcard: boolean;
    thai: boolean;
    payment_type: boolean;
  job_date: string;
  payment: string | null;
  pay_amount: string | number | null;
  accept_amount: string | number | null;
  treat: boolean;
  accept: string;
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
  job_date: '',
  payment: null,
  pay_amount: '',
  accept_amount: '',
  treat: false,
  accept: '',
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
  job_date: job.job_date || '',
  payment: job.payment ?? null,
  pay_amount: job.pay_amount ?? '',
  accept_amount: job.accept_amount ?? '',
  treat: Boolean(job.treat),
  accept: job.accept ?? '',
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
  // new fields: explicitly include job_date, pay/accept amounts, treat and accept
  job_date: formData.job_date ? String(formData.job_date).trim() : '',
  // backend column `payment` kept null from frontend per request
    payment: formData.payment ? String(formData.payment).trim() : null,
  pay_amount: formData.pay_amount ? String(formData.pay_amount).trim() : null,
  accept_amount: formData.accept_amount ? Number(formData.accept_amount) : null,
  treat: Boolean(formData.treat),
  accept: formData.accept?.trim() || '',
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
                {/* Top row: Date, Job Number, Title */}
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('jobDateLabel')}</label>
                    <input
                      type="date"
                      value={formData.job_date}
                      onChange={(e) => updateFormData({ job_date: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Number</label>
                    <input
                      type="text"
                      value={formData.job_num}
                      onChange={(e) => updateFormData({ job_num: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Job Number (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">အလုပ်အမည် *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">အလုပ်နေရာ *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('paymentLabel')}</label>
                    <input
                      type="text"
                      value={formData.payment ?? ''}
                      onChange={(e) => updateFormData({ payment: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ပုတ်ပြတ် ၊ လစဉ် ၊ ..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-2 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pay Amount (Baht)</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={formData.pay_amount ?? ''}
                        onChange={(e) => updateFormData({ pay_amount: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-l-lg rounded-r-none"
                        placeholder="500-1000"
                      />
                      <span className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50">฿</span>
                    </div>
                  </div>

                  <div>
                    {/* accept amount: use placeholder instead of label to keep row compact */}
                    <label className="block text-sm font-medium text-gray-700 mb-2 opacity-0">&nbsp;</label>
                    <input
                      type="number"
                      value={formData.accept_amount as any}
                      onChange={(e) => updateFormData({ accept_amount: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="အလုပ်သမားဦးရေ"
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                    <input
                      type="text"
                      value={formData.accept}
                      onChange={(e) => updateFormData({ accept: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 transition-all placeholder-gray-400"
                      placeholder={t('လင်မယားတွဲလက်ခံသည်')}
                    />
                  </div>
                </div>

                {/* Requirements and checkboxes - move Treat to bottom */}
        <div className="grid grid-cols-3 gap-4 mt-3">
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
          title="Require Thai language"
                    />
                    <span className="text-sm font-medium text-gray-700">ထိုင်းစကားတတ်ရန်လိုသည်</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.stay}
                      onChange={(e) => updateFormData({ stay: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          title="Accommodation provided"
                    />
                    <span className="text-sm font-medium text-gray-700">နေစရာ ပေးသည်</span>
                  </label>
                </div>



                <div className="mt-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.treat}
                      onChange={(e) => updateFormData({ treat: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{t('treatYes')}</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Media (Images, Videos & External Links)</label>
                  
                  {/* File upload for images/videos */}
                  <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">📁 Upload Files (Images & Videos)</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setIsUploading(true);
                        setUploadProgress(0);
                        
                        let fileType: 'image' | 'video' = 'image';
                        if (file.type.startsWith('video/')) fileType = 'video';
                        
                        // Show initial toast
                        const loadingToast = toast.loading(`Uploading ${fileType}... 0%`);
                        
                        try {
                          // @ts-ignore
                          const { StorageService } = await import('../../lib/storage');
                          
                          const uploadedUrl = await StorageService.uploadFile(
                            file, 
                            'images', 
                            fileType === 'video' ? 'videos' : undefined, // Put videos in a 'videos' folder
                            fileType,
                            (percentage) => {
                              setUploadProgress(percentage);
                              toast.loading(`Uploading ${fileType}... ${percentage}%`, { id: loadingToast });
                            }
                          );
                          
                          updateFormData({ media: [...formData.media, uploadedUrl] });
                          toast.success(`${fileType === 'video' ? 'Video' : 'Image'} uploaded successfully!`, { id: loadingToast });
                        } catch (error) {
                          console.error('Upload error:', error);
                          toast.error(`Failed to upload ${fileType}. Please try again.`, { id: loadingToast });
                        } finally {
                          setIsUploading(false);
                          setUploadProgress(null);
                          e.target.value = '';
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isUploading}
                    />
                    
                    {/* Upload Progress Bar */}
                    {isUploading && uploadProgress !== null && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-blue-700">Uploading...</span>
                          <span className="text-xs font-medium text-blue-700">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="flex items-center">
                        ✅ <span className="ml-1"><strong>Images:</strong> PNG, JPG, GIF, WebP (no size limit)</span>
                      </p>
                      <p className="flex items-center">
                        ✅ <span className="ml-1"><strong>Videos:</strong> MP4, WebM, MOV, AVI (no size limit)</span>
                      </p>
                      <p className="text-amber-600 mt-1 flex items-start">
                        ⚡ <span className="ml-1"><strong>Note:</strong> Large files may take longer to upload. For better user experience, consider compressing very large videos.</span>
                      </p>
                      <p className="text-gray-500 mt-1">Files will be securely stored in Supabase and accessible via direct URLs</p>
                    </div>
                  </div>

                  {/* URL input for external media */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔗 Media Files & Links {formData.media.length > 0 && `(${formData.media.length} items)`}
                    </label>
                    
                    {/* Show uploaded files */}
                    {formData.media.length > 0 && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">📎 Uploaded Media:</p>
                        <div className="space-y-2">
                          {formData.media.map((url: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2 mb-2 bg-white p-2 rounded border">
                              {/* Media preview */}
                              <div className="flex-shrink-0">
                                {url && url.match(/(youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm|\.ogg|\.mov|\.avi)/i) ? (
                                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                    <span className="text-blue-600 text-xs font-bold">📹</span>
                                  </div>
                                ) : url && url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                                  <img src={url} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                    <span className="text-gray-600 text-xs font-bold">🔗</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* URL input */}
                              <input
                                type="text"
                                value={url}
                                onChange={e => {
                                  const newMedia = [...formData.media]
                                  newMedia[index] = e.target.value
                                  updateFormData({ media: newMedia })
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                placeholder="Media URL"
                              />
                              
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newMedia = formData.media.filter((_, i) => i !== index)
                                  updateFormData({ media: newMedia })
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Remove media"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Add new external link button */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => updateFormData({ media: [...formData.media, ''] })}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add External Link (YouTube, Vimeo, etc.)
                      </button>
                    </div>
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
            key: 'job_date',
            header: 'Job Date',
            render: (job: Job) => (
              <div className="text-sm text-gray-700 whitespace-nowrap">
                {job.job_date ? new Date(job.job_date).toLocaleDateString() : '-'}
              </div>
            ),
            desktopOnly: true
          },
          {
            key: 'pay_amount',
            header: 'Pay',
            render: (job: Job) => (
              <div className="text-sm text-gray-700 whitespace-nowrap">
                {job.pay_amount ? `${job.pay_amount} ฿` : '-'}
              </div>
            ),
            desktopOnly: true
          },
          {
            key: 'accept_amount',
            header: 'Accepted',
            render: (job: Job) => (
              <div className="text-sm text-gray-700 whitespace-nowrap">
                {job.accept_amount != null ? job.accept_amount : '-'}
              </div>
            ),
            desktopOnly: true
          },
          {
            key: 'treat',
            header: 'Treat',
            render: (job: Job) => (
              <div className="text-sm text-gray-700 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Coffee className="h-4 w-4 text-yellow-600" />
                  <span>{job.treat ? t('treatYes') : t('treatNo')}</span>
                </div>
              </div>
            ),
            desktopOnly: true
          },
          {
            key: 'accept',
            header: 'Accept',
            render: (job: Job) => (
              <div className="text-sm text-gray-700 whitespace-nowrap">
                {job.accept ?? '-'}
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
