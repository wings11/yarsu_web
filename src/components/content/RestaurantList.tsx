'use client'

import React from 'react'
import { useRestaurants } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import ImageCarousel from '@/components/ui/ImageCarousel'
import ExpandableText from '@/components/ui/ExpandableText'
import { SmartLink } from '@/components/ui/SmartLink'
import { formatCurrency } from '@/lib/utils'
import { Star, MapPin } from 'lucide-react'
import type { Restaurant } from '@/lib/supabase'

export default function RestaurantList() {
  const { data: restaurants, isLoading, error } = useRestaurants()

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
        <p>Failed to load restaurants. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurants</h1>
        <p className="text-gray-600">Discover amazing places to dine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants?.map((restaurant: Restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  )
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image Carousel */}
      <ImageCarousel 
        images={restaurant.images || []}
        alt={restaurant.name}
        className="h-48"
        showControls={true}
        autoPlay={false}
      />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 leading-tight">
            {restaurant.name}
          </h3>
          <div className="flex items-center text-yellow-500 ml-2 flex-shrink-0">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{restaurant.admin_rating}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <SmartLink 
            text={restaurant.location} 
            iconType="location"
            className="text-sm"
            fallbackText="Location not specified"
          />
        </div>

        {restaurant.popular_picks && restaurant.popular_picks.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Popular Picks:</h4>
            <div className="flex flex-wrap gap-1">
              {restaurant.popular_picks.slice(0, 3).map((pick, index) => (
                <span 
                  key={index}
                  className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                >
                  {pick}
                </span>
              ))}
              {restaurant.popular_picks.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{restaurant.popular_picks.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {restaurant.notes && (
          <ExpandableText 
            text={restaurant.notes}
            maxLines={2}
            className="text-sm text-gray-600"
          />
        )}
      </CardContent>
    </Card>
  )
}
