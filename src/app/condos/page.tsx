import React from 'react'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import CondoList from '@/components/content/CondoList'

export default function CondosPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <CondoList />
      </Layout>
    </ProtectedRoute>
  )
}
