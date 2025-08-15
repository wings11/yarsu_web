'use client'

import React, { useState } from 'react'
import { useRestaurants } from '@/hooks/useApi'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import ImageCarousel from '@/components/ui/ImageCarousel'
import ExpandableText from '@/components/ui/ExpandableText'
import { SmartLink } from '@/components/ui/SmartLink'
import CardStack from '@/components/ui/animations/CardStack'
import { FadeInUp, StaggeredList, StaggeredItem, AnimatedButton } from '@/components/ui/animations/MicroAnimations'
import { Star, MapPin, Utensils, LayoutGrid, Layers } from 'lucide-react'
import type { Restaurant } from '@/lib/supabase'

export default function RestaurantList() {
  const { data: restaurants, isLoading, error } = useRestaurants()
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
        <p>Failed to load restaurants. Please try again later.</p>
      </FadeInUp>
    )
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FadeInUp className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurants</h1>
          <p className="text-gray-600">Discover amazing places to dine</p>
        </FadeInUp>
        <FadeInUp delay={0.2} className="text-center py-12">
          <div className="text-gray-500">
            <Utensils className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No restaurants available</h3>
            <p>Check back later for new restaurants</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurants</h1>
            <p className="text-gray-600">Discover amazing places to dine</p>
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
            items={restaurants}
            renderCard={(restaurant, index) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />}
            className="mb-8"
          />
        </FadeInUp>
      ) : (
        <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants?.map((restaurant: Restaurant, index: number) => (
            <StaggeredItem key={restaurant.id}>
              <RestaurantCard restaurant={restaurant} />
            </StaggeredItem>
          ))}
        </StaggeredList>
      )}
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
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex-1 leading-tight">
            {restaurant.name}
          </h3>
          <div className="flex items-center text-yellow-500 ml-2 flex-shrink-0">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{restaurant.admin_rating}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4">
          <SmartLink 
            text={restaurant.location} 
            iconType="location"
            className="text-sm"
            fallbackText="Location not specified"
          />
        </div>

        {/* All Popular Picks */}
        {restaurant.popular_picks && restaurant.popular_picks.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Popular Picks:</h4>
            <div className="flex flex-wrap gap-2">
              {restaurant.popular_picks.map((pick, index) => (
                <span 
                  key={index}
                  className="bg-primary-100 text-primary-800 text-xs px-3 py-1 rounded-full"
                >
                  {pick}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {restaurant.notes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Details:</h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {restaurant.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
