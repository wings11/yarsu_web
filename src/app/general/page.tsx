'use client'

import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { useGeneralPosts } from '@/hooks/useApi'
import { Calendar } from 'lucide-react'
import { isImageUrl, isVideoUrl } from '@/utils/mediaUtils'
import type { GeneralPost } from '@/lib/supabase'

export default function GeneralPostsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">General Posts</h1>
            <p className="text-gray-600">Latest news and updates from YarSu</p>
          </div>
          
          <GeneralPostsList />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

function GeneralPostsList() {
  const { data: posts, isLoading, error } = useGeneralPosts()

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
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
        <h3 className="text-red-800 font-medium mb-2">Error loading posts</h3>
        <p className="text-red-600">Unable to load general posts. Please try again later.</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <h3 className="text-gray-900 font-medium mb-2">No posts yet</h3>
        <p className="text-gray-600">Check back later for updates and announcements.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post: GeneralPost) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="prose prose-gray max-w-none mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.text}</p>
          </div>
          
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.media.map((mediaUrl, index) => (
                <div key={index} className="w-full">
                  {isImageUrl(mediaUrl) ? (
                    <img
                      src={mediaUrl}
                      alt={`Post media ${index + 1}`}
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
          )}
        </div>
      ))}
    </div>
  )
}
