'use client'

import React, { useState } from 'react'
import { useCourses } from '@/hooks/useApi'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import ExpandableText from '@/components/ui/ExpandableText'
import { SmartLink } from '@/components/ui/SmartLink'
import CardStack from '@/components/ui/animations/CardStack'
import { FadeInUp, StaggeredList, StaggeredItem, AnimatedButton } from '@/components/ui/animations/MicroAnimations'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Clock, LayoutGrid, Layers } from 'lucide-react'
import type { Course } from '@/lib/supabase'

export default function CourseList() {
  const { data: courses, isLoading, error } = useCourses()
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
        <p>Failed to load courses. Please try again later.</p>
      </FadeInUp>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FadeInUp className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
            <p className="text-gray-600">Learn new skills and advance your career</p>
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
            items={courses}
            renderCard={(course, index) => <CourseCard key={course.id} course={course} />}
            className="mb-8"
          />
        </FadeInUp>
      ) : (
        <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course: Course, index: number) => (
            <StaggeredItem key={course.id}>
              <CourseCard course={course} />
            </StaggeredItem>
          ))}
        </StaggeredList>
      )}
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {course.name}
        </h3>

        <div className="flex items-center text-gray-600 mb-2">
          <SmartLink 
            text={course.location} 
            iconType="location"
            className="text-sm"
            fallbackText="Location TBA"
          />
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm">{course.duration}</span>
        </div>

        <div className="mb-3">
          <div className="text-lg font-bold text-primary-600">
            {course.price === 0 ? 'Free' : formatCurrency(course.price)}
          </div>
          <div className="text-sm text-gray-600">
            {course.centre_name}
          </div>
        </div>

        {course.notes && (
          <ExpandableText 
            text={course.notes}
            maxLines={3}
            className="text-sm text-gray-600"
          />
        )}
      </CardContent>
    </Card>
  )
}
