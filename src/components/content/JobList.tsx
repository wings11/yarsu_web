'use client'

import React, { useState } from 'react'
import { useJobs } from '@/hooks/useApi'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import ExpandableText from '@/components/ui/ExpandableText'
import { SmartLink } from '@/components/ui/SmartLink'
import CardStack from '@/components/ui/animations/CardStack'
import { FadeInUp, StaggeredList, StaggeredItem, AnimatedButton } from '@/components/ui/animations/MicroAnimations'
import { MapPin, CreditCard, Globe, Home, Briefcase, Calendar, RefreshCw, LayoutGrid, Layers, ChevronLeft, ChevronRight, Hand, ArrowLeft, ArrowRight, Users, Coffee } from 'lucide-react'
import type { Job } from '@/lib/supabase'

export default function JobList() {
  const { data: jobs, isLoading, error, refetch } = useJobs()
  const { t } = useLanguage()
  const [viewMode, setViewMode] = useState<'grid' | 'stack'>('grid')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <FadeInUp className="text-center text-red-600 p-8">
        <p>{t('failedLoadJobs')}</p>
        <div className="mt-4 text-sm text-gray-600">
          <p>This might be due to:</p>
          <ul className="list-disc list-inside mt-2">
            <li>{t('needLoginJobs')}</li>
            <li>{t('networkIssues')}</li>
            <li>{t('serverMaintenance')}</li>
          </ul>
        </div>
        <div className="mt-4">
          <AnimatedButton 
            onClick={() => refetch()} 
            variant="bounce"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('tryAgain')}
          </AnimatedButton>
        </div>
      </FadeInUp>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FadeInUp className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('jobs')}</h1>
          <p className="text-gray-600">{t('findCareerOpportunity')}</p>
        </FadeInUp>
        <FadeInUp delay={0.2} className="text-center py-12">
          <div className="text-gray-500">
            <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t('noJobsAvailable')}</h3>
            <p>{t('checkBackLater')}</p>
          </div>
        </FadeInUp>
      </div>
    )
  }

  const handleSwipeRight = (job: Job) => {
    console.log('Viewed job:', job.title)
    // Just for logging, no action buttons
  }

  const handleSwipeLeft = (job: Job) => {
    console.log('Viewed job:', job.title)
    // Just for logging, no action buttons
  }

  const handleSwipeUp = (job: Job) => {
    console.log('Viewed job details:', job.title)
    // Just for logging, no action buttons
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FadeInUp className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('jobs')}</h1>
            <p className="text-gray-600">{t('findCareerOpportunity')}</p>
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <AnimatedButton
              onClick={() => setViewMode('grid')}
              variant="scale"
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </AnimatedButton>
            <AnimatedButton
              onClick={() => setViewMode('stack')}
              variant="scale"
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'stack' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="h-5 w-5" />
            </AnimatedButton>
          </div>
        </div>
      </FadeInUp>

      {viewMode === 'stack' ? (
        <FadeInUp delay={0.3} className="max-w-md mx-auto">
          <CardStack
            items={jobs}
            renderCard={(job, index) => <JobCard key={job.id} job={job} />}
            className="mb-8"
          />
        </FadeInUp>
      ) : (
        <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job: Job, index: number) => (
            <StaggeredItem key={job.id}>
              <JobCard job={job} />
            </StaggeredItem>
          ))}
        </StaggeredList>
      )}
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const { t } = useLanguage()
  
  const features = [
    { key: 'pinkcard', icon: CreditCard, label: t('pinkCard'), color: 'pink' },
    { key: 'thai', icon: Globe, label: t('thaiLanguage'), color: 'blue' },
    { key: 'payment_type', icon: CreditCard, label: t('paymentAvailable'), color: 'green' },
    { key: 'stay', icon: Home, label: t('accommodation'), color: 'purple' },
  ]

  const getFeatureColor = (color: string) => {
    switch (color) {
      case 'pink': return 'bg-pink-100 text-pink-800'
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  // ...existing code...
  // Import mediaUtils and VideoPlayer
  // @ts-ignore
  const { isImageUrl, getVideoType } = require('@/utils/mediaUtils');
  // @ts-ignore
  const { VideoPlayer } = require('@/components/ui/VideoPlayer');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-2">
            {job.job_date && (
              <div className="text-sm text-gray-500 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(job.job_date).toLocaleDateString()}</span>
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900">
              {job.job_num ? <span className="text-blue-600 mr-2">[{job.job_num}]</span> : null}
              {job.title}
            </h3>
          </div>
          <Briefcase className="h-5 w-5 text-gray-500 flex-shrink-0" />
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-2">
          <SmartLink 
            text={job.job_location} 
            iconType="location"
            className="text-sm"
            fallbackText="Location not specified"
          />
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-gray-600 space-x-3 text-sm">
            {job.pay_amount != null && (
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                <span>{job.pay_amount} ฿</span>
              </div>
            )}
          </div>
          {job.accept_amount != null && (
            <div className="text-sm text-gray-600">
              <strong>{t('acceptedLabel')}:</strong> {job.accept_amount}
            </div>
          )}
        </div>

        {/* Accommodation Location - Show only if stay is true and location exists */}
        {job.stay && job.location && (
          <div className="flex items-center text-gray-600 mb-4">
            <Home className="h-4 w-4 mr-2" />
            <span className="text-sm">{t('acco')} </span>
            <SmartLink 
              text={job.location} 
              iconType="location"
              className="text-sm"
              showIcon={false}
            />
          </div>
        )}


        {/* All Features */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
          <div className="flex flex-wrap gap-2">
            {features.map(({ key, icon: Icon, label, color }) => {
              if (key === 'payment_type') {
                return (
                  <div key={key} className={`flex items-center text-xs px-2 py-1 rounded-full ${getFeatureColor(color)}`}>
                    <Icon className="h-3 w-3 mr-1" />
                    <span className="capitalize">{job.payment ?? '-'}</span>
                  </div>
                )
              }
              if (key === 'pinkcard' || key === 'thai' || key === 'stay') {
                return job[key as keyof Job] && (
                  <div key={key} className={`flex items-center text-xs px-2 py-1 rounded-full ${getFeatureColor(color)}`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {label}
                  </div>
                )
              }
              return null
            })}
            {/* Treat feature shown separately with meal icon */}
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${getFeatureColor('green')}`}>
              <Coffee className="h-3 w-3 mr-1 text-yellow-600" />
              <span>{job.treat ? t('treatYes') : t('treatNo')}</span>
            </div>
            {/* Accept text shown if present */}
            {job.accept && (
              <div className={`flex items-center text-xs px-2 py-1 rounded-full ${getFeatureColor('gray')}`}>
                <ArrowRight className="h-3 w-3 mr-1" />
                <span className="capitalize">{job.accept}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {job.notes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Details:</h4>
            <ExpandableText 
              text={job.notes}
              maxLines={3}
              className="text-sm text-gray-600"
            />
          </div>
        )}


        {/* Media Section */}
        {Array.isArray(job.media) && job.media.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">ပုံ/Videoများ :</h4>
            <div className="flex flex-wrap gap-3">
              {job.media.map((url: string, idx: number) => {
                const videoType = getVideoType(url);
                return (
                  <div key={idx} className="w-full md:w-1/2 lg:w-1/3">
                    {isImageUrl(url) ? (
                      <img src={url} alt="Job Media" className="w-full h-40 object-cover rounded border mb-2" />
                    ) : videoType ? (
                      <VideoPlayer url={url} className="w-full h-40 mb-2" showTitle={false} />
                    ) : (
                      <SmartLink text={url} className="text-blue-600 underline break-all" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
