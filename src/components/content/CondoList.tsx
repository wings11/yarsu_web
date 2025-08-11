'use client'

import React from 'react'
import { useCondos } from '@/hooks/useApi'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useLanguage } from '@/contexts/LanguageContext'
import ImageCarousel from '@/components/ui/ImageCarousel'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Wifi, Dumbbell, Trees, Briefcase, Waves } from 'lucide-react'
import type { Condo } from '@/lib/supabase'

export default function CondoList() {
  const{t}=useLanguage()
  const { data: condos, isLoading, error } = useCondos()

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
        <p>Failed to load condos. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('condos')}</h1>
        <p className="text-gray-600">{t('longTermAccommodation')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {condos?.map((condo: Condo) => (
          <CondoCard key={condo.id} condo={condo} />
        ))}
      </div>
    </div>
  )
}

function CondoCard({ condo }: { condo: Condo }) {
    const { t } = useLanguage()
  const amenities = [
  
    { key: 'free_wifi', icon: Wifi, label: t('wifi') },
    { key: 'gym', icon: Dumbbell, label: t('gym') },
    { key: 'swimming_pool', icon: Waves, label: t('pool') },
    { key: 'garden', icon: Trees, label: t('garden') },
    { key: 'co_working_space', icon: Briefcase, label: t('coWorking') },
  ]

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image Carousel */}
      <ImageCarousel 
        images={condo.images || []}
        alt={condo.name}
        className="h-48"
        showControls={true}
        autoPlay={false}
      />
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {condo.name}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{condo.address}</span>
        </div>

        <div className="mb-3">
          <div className="text-lg font-bold text-primary-600">
            {formatCurrency(condo.rent_fee)}/{t('month')}
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-3">
          {amenities.map(({ key, icon: Icon, label }) => (
            condo[key as keyof Condo] && (
              <div key={key} className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </div>
            )
          ))}
        </div>

        {condo.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {condo.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
