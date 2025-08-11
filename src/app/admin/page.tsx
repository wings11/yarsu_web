'use client'

import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Check if user is admin or superadmin
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    router.push('/')
    return null
  }

  return (
    <ProtectedRoute>
      <Layout>
        <AdminDashboard />
      </Layout>
    </ProtectedRoute>
  )
}
