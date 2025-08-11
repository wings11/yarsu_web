'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui/Loading'
import Layout from '@/components/Layout'
import RestaurantList from '@/components/content/RestaurantList'
import { useRouter } from 'next/navigation'

export default function RestaurantsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <Layout>
      <RestaurantList />
    </Layout>
  )
}
