'use client'

import React from 'react'
import { useJobs } from '@/hooks/useApi'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { MapPin, CreditCard, Globe, Home, Briefcase, RefreshCw } from 'lucide-react'
import type { Job } from '@/lib/supabase'

export default function JobList() {
  const { data: jobs, isLoading, error, refetch } = useJobs()
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
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
          <Button onClick={() => refetch()} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('jobs')}</h1>
          <p className="text-gray-600">{t('findCareerOpportunity')}</p>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t('noJobsAvailable')}</h3>
            <p>{t('checkBackLater')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('jobs')}</h1>
        <p className="text-gray-600">{t('findCareerOpportunity')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs?.map((job: Job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex-1 pr-2">
            {job.title}
          </h3>
          <Briefcase className="h-5 w-5 text-gray-500 flex-shrink-0" />
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">{job.job_location || 'Location not specified'}</span>
        </div>

        {/* Accommodation Location - Show only if stay is true and location exists */}
        {job.stay && job.location && (
          <div className="flex items-center text-gray-600 mb-4">
            <Home className="h-4 w-4 mr-2" />
            <span className="text-sm">Accommodation: {job.location}</span>
          </div>
        )}

        {/* Features */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
          <div className="flex flex-wrap gap-2">
            {features.map(({ key, icon: Icon, label, color }) => {
              if (key === 'payment_type' && job[key as keyof Job]) {
                return (
                  <div key={key} className={`flex items-center text-xs px-2 py-1 rounded-full ${getFeatureColor(color)}`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {job.payment_type ? t('daily') : t('monthly')}
                  </div>
                )
              }
              return job[key as keyof Job] && (
                <div key={key} className={`flex items-center text-xs px-2 py-1 rounded-full ${getFeatureColor(color)}`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </div>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        {job.notes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Details:</h4>
            <p className="text-sm text-gray-600 line-clamp-3">
              {job.notes}
            </p>
          </div>
        )}

        {/* Apply Button - TODO: Implement in later version */}
        {/* 
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button className="w-full" size="sm">
            Apply Now
          </Button>
        </div>
        */}
      </CardContent>
    </Card>
  )
}
