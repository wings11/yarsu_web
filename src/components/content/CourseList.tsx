'use client'

import React from 'react'
import { useCourses } from '@/hooks/useApi'
import { Card, CardContent } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import ExpandableText from '@/components/ui/ExpandableText'
import { SmartLink } from '@/components/ui/SmartLink'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Clock } from 'lucide-react'
import type { Course } from '@/lib/supabase'

export default function CourseList() {
  const { data: courses, isLoading, error } = useCourses()

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
        <p>Failed to load courses. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-gray-600">Learn new skills and advance your career</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course: Course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
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
            {formatCurrency(course.price)}
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
