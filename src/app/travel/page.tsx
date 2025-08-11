import React from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import TravelList from '@/components/content/TravelList'

export default function TravelPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <TravelList />
      </Layout>
    </ProtectedRoute>
  )
}
