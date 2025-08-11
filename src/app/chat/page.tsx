'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui/Loading'
import Layout from '@/components/Layout'
import ChatInterface from '@/components/chat/ChatInterface'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    router.push('/login')
    return null
  }

  // Check if user is admin for layout decision
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // For admins, use normal layout; for users, use fullscreen chat
  if (isAdmin) {
    return (
      <Layout>
        <ChatInterface />
      </Layout>
    )
  }

  // For regular users, return fullscreen chat without layout
  return <ChatInterface />
}
