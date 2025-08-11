'use client'

import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { useDocs } from '@/hooks/useApi'
import { Calendar, FileText } from 'lucide-react'
import { isImageUrl, isVideoUrl } from '@/utils/mediaUtils'
import type { Doc } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DocsPage() {
    const { t } = useLanguage()
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">{t('Description')}</p>
          </div>
          
          <DocsList />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

function DocsList() {
  const { data: docs, isLoading, error } = useDocs()

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Error loading documents</h3>
        <p className="text-red-600">Unable to load documents. Please try again later.</p>
      </div>
    )
  }

  if (!docs || docs.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-gray-900 font-medium mb-2">No documents available</h3>
        <p className="text-gray-600">Check back later for important documents and guides.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {docs.map((doc: Doc) => (
        <div key={doc.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="prose prose-gray max-w-none mb-4">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{doc.text}</div>
          </div>
          
          {doc.media && doc.media.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Attachments:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doc.media.map((mediaUrl, index) => (
                  <div key={index} className="relative">
                    {isImageUrl(mediaUrl) ? (
                      <img
                        src={mediaUrl}
                        alt={`Document attachment ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <VideoPlayer
                        url={mediaUrl}
                        className="w-full h-48 rounded-lg shadow-sm"
                        showTitle={false}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
