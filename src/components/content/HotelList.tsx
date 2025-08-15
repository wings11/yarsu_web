'use client'

import React, { useState } from 'react'
import { useHotels } from '@/hooks/useApi'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import ImageCarousel from '@/components/ui/ImageCarousel'
import ExpandableText from '@/components/ui/ExpandableText'
import CardStack from '@/components/ui/animations/CardStack'
import { FadeInUp, StaggeredList, StaggeredItem, AnimatedButton } from '@/components/ui/animations/MicroAnimations'
import { formatCurrency } from '@/lib/utils'
import { Star, MapPin, Wifi, Car, Waves, Coffee, Building, RefreshCw, LayoutGrid, Layers } from 'lucide-react'
import type { Hotel } from '@/lib/supabase'

export default function HotelList() {
  const { data: hotels, isLoading, error, status, refetch } = useHotels()
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
        <p>{t('failedLoadHotels')}</p>
        <div className="mt-4 text-sm text-gray-600">
          <p>This might be due to:</p>
          <ul className="list-disc list-inside mt-2">
            <li>{t('needLoginHotels')}</li>
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

  if (!hotels || hotels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FadeInUp className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('hotels')}</h1>
          <p className="text-gray-600">{t('findPerfectStay')}</p>
        </FadeInUp>
        <FadeInUp delay={0.2} className="text-center py-12">
          <div className="text-gray-500">
            <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t('noHotelsAvailable')}</h3>
            <p>{t('checkBackLater')}</p>
          </div>
        </FadeInUp>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FadeInUp className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('hotels')}</h1>
            <p className="text-gray-600">{t('findPerfectStay')}</p>
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
            items={hotels}
            renderCard={(hotel, index) => <HotelCard key={hotel.id} hotel={hotel} />}
            className="mb-8"
          />
        </FadeInUp>
      ) : (
        <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels?.map((hotel: Hotel, index: number) => (
            <StaggeredItem key={hotel.id}>
              <HotelCard hotel={hotel} />
            </StaggeredItem>
          ))}
        </StaggeredList>
      )}
    </div>
  )
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  const { t } = useLanguage()
  
  const amenities = [
    { key: 'free_wifi', icon: Wifi, label: t('wifi') },
    { key: 'breakfast', icon: Coffee, label: t('bf') },
    { key: 'swimming_pool', icon: Waves, label: t('pool') },
  ]

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image Carousel */}
      <ImageCarousel 
        images={hotel.images || []}
        alt={hotel.name}
        className="h-48"
        showControls={true}
        autoPlay={false}
      />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 leading-tight">
            {hotel.name}
          </h3>
          <div className="flex items-center text-yellow-500 ml-2 flex-shrink-0">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{hotel.admin_rating}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{hotel.address}</span>
        </div>

        <div className="mb-3">
          <div className="text-lg font-bold text-primary-600">
            {formatCurrency(hotel.price)}/{t('night')}
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-3">
          {amenities.map(({ key, icon: Icon, label }) => (
            hotel[key as keyof Hotel] && (
              <div key={key} className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </div>
            )
          ))}
        </div>

        {/* Nearby places */}
        {hotel.nearby_famous_places && hotel.nearby_famous_places.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">{t('nearby')}</h4>
            <div className="flex flex-wrap gap-1">
              {hotel.nearby_famous_places.slice(0, 2).map((place, index) => (
                <span   
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {place}
                </span>
              ))}
              {hotel.nearby_famous_places.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{hotel.nearby_famous_places.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {hotel.notes && (
          <ExpandableText 
            text={hotel.notes}
            maxLines={2}
            className="text-sm text-gray-600"
          />
        )}
      </CardContent>
    </Card>
  )
}
