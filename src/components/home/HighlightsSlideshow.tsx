'use client'

import React, { useState, useEffect } from 'react'
import { useHighlights } from '@/hooks/useApi'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Highlight } from '@/lib/supabase'

export default function HighlightsSlideshow() {
  const { data: highlights, isLoading, error } = useHighlights()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance slideshow
  useEffect(() => {
    if (!highlights || highlights.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [highlights])

  const goToPrevious = () => {
    if (!highlights) return
    setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length)
  }

  const goToNext = () => {
    if (!highlights) return
    setCurrentIndex((prev) => (prev + 1) % highlights.length)
  }

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading highlights...</div>
      </div>
    )
  }

  if (error || !highlights || highlights.length === 0) {
    return null // Hide if no highlights
  }

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg mb-8">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          src={highlights[currentIndex].image}
          alt={`Highlight ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
          }}
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Navigation Arrows */}
      {highlights.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
            aria-label="Previous highlight"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
            aria-label="Next highlight"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {highlights.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {highlights.map((_: Highlight, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to highlight ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {highlights.length > 1 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {highlights.length}
        </div>
      )}
    </div>
  )
}
