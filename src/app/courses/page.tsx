import React from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import CourseList from '@/components/content/CourseList'

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <CourseList />
      </Layout>
    </ProtectedRoute>
  )
}
