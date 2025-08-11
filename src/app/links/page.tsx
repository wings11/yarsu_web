'use client'

import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { useLinks } from '@/hooks/useApi'
import { ExternalLink, Calendar } from 'lucide-react'
import type { Link } from '@/lib/supabase'

export default function LinksPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Useful Links</h1>
            <p className="text-gray-600">External resources and social media</p>
          </div>
          
          <LinksList />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

// Social media icons mapping
const socialIcons: Record<string, { icon: string; color: string; bgColor: string }> = {
  'facebook': { icon: '📘', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'instagram': { icon: '📷', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  'twitter': { icon: '🐦', color: 'text-blue-400', bgColor: 'bg-blue-50' },
  'tiktok': { icon: '🎵', color: 'text-black', bgColor: 'bg-gray-50' },
  'youtube': { icon: '📺', color: 'text-red-600', bgColor: 'bg-red-50' },
  'line': { icon: '💬', color: 'text-green-500', bgColor: 'bg-green-50' },
  'whatsapp': { icon: '📱', color: 'text-green-600', bgColor: 'bg-green-50' },
  'telegram': { icon: '✈️', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'linkedin': { icon: '💼', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  'website': { icon: '🌐', color: 'text-gray-600', bgColor: 'bg-gray-50' },
}

function LinksList() {
  const { data: links, isLoading, error } = useLinks()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Error loading links</h3>
        <p className="text-red-600">Unable to load links. Please try again later.</p>
      </div>
    )
  }

  if (!links || links.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <ExternalLink className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-gray-900 font-medium mb-2">No links available</h3>
        <p className="text-gray-600">Check back later for useful links and resources.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map((link: Link) => {
        const platformKey = link.platform.toLowerCase().replace(/\s+/g, '')
        const socialIcon = socialIcons[platformKey] || socialIcons['website']
        
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${socialIcon.bgColor}`}>
                <span className="text-2xl">{socialIcon.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${socialIcon.color} mb-1`}>
                  {link.platform}
                </h3>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(link.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </div>
            
            <p className="text-sm text-gray-600 truncate">
              {link.url}
            </p>
          </a>
        )
      })}
    </div>
  )
}
