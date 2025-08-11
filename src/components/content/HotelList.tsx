'use client'

import React from 'react'
import { useHotels } from '@/hooks/useApi'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { Star, MapPin, Wifi, Car, Waves, Coffee, Building, RefreshCw } from 'lucide-react'
import type { Hotel } from '@/lib/supabase'

export default function HotelList() {
  const { data: hotels, isLoading, error, status, refetch } = useHotels()
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
          <Button onClick={() => refetch()} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    )
  }

  if (!hotels || hotels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('hotels')}</h1>
          <p className="text-gray-600">{t('findPerfectStay')}</p>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t('noHotelsAvailable')}</h3>
            <p>{t('checkBackLater')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('hotels')}</h1>
        <p className="text-gray-600">{t('findPerfectStay')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels?.map((hotel: Hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
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
      {hotel.images && hotel.images.length > 0 && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={hotel.images[0]} 
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
            }}
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {hotel.name}
          </h3>
          <div className="flex items-center text-yellow-500 ml-2">
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
          <p className="text-sm text-gray-600 line-clamp-2">
            {hotel.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
