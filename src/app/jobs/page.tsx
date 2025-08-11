import React from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import JobList from '@/components/content/JobList'

export default function JobsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <JobList />
      </Layout>
    </ProtectedRoute>
  )
}
