'use client'

import React from 'react'
import { useTravelPosts } from '@/hooks/useApi'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import ImageCarousel from '@/components/ui/ImageCarousel'
import { Star, MapPin } from 'lucide-react'
import type { TravelPost } from '@/lib/supabase'

export default function TravelList() {
  const { data: travelPosts, isLoading, error } = useTravelPosts()

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
        <p>Failed to load travel posts. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Travel</h1>
        <p className="text-gray-600">Discover amazing destinations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {travelPosts?.map((post: TravelPost) => (
          <TravelCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

function TravelCard({ post }: { post: TravelPost }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image Carousel */}
      <ImageCarousel 
        images={post.images || []}
        alt={post.name}
        className="h-48"
        showControls={true}
        autoPlay={false}
      />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {post.name}
          </h3>
          <div className="flex items-center text-yellow-500 ml-2">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{post.admin_rating}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{post.place}</span>
        </div>

        {/* Highlights */}
        {post.highlights && post.highlights.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Highlights:</h4>
            <div className="flex flex-wrap gap-1">
              {post.highlights.slice(0, 3).map((highlight, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {highlight}
                </span>
              ))}
              {post.highlights.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{post.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {post.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {post.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
