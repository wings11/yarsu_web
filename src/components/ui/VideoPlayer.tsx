import React from 'react'
import { ExternalLink, Play } from 'lucide-react'
import { getVideoType, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '@/utils/mediaUtils'

interface VideoPlayerProps {
  url: string
  className?: string
  showTitle?: boolean
  isPreview?: boolean
}

export function VideoPlayer({ url, className = '', showTitle = true, isPreview = false }: VideoPlayerProps) {
  const videoType = getVideoType(url)
  
  if (!videoType) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded p-4 ${className}`}>
        <p className="text-gray-600 text-sm">Invalid video URL</p>
      </div>
    )
  }

  const renderVideo = () => {
    switch (videoType) {
      case 'youtube':
        const youtubeEmbedUrl = getYouTubeEmbedUrl(url)
        return (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={youtubeEmbedUrl}
              className="absolute top-0 left-0 w-full h-full rounded"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            />
          </div>
        )
      
      case 'vimeo':
        const vimeoEmbedUrl = getVimeoEmbedUrl(url)
        return (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={vimeoEmbedUrl}
              className="absolute top-0 left-0 w-full h-full rounded"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo video"
            />
          </div>
        )
      
      case 'direct':
        return (
          <video
            src={url}
            className="w-full rounded"
            controls
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )
      
      case 'other':
        return (
          <div className="bg-gray-100 border border-gray-300 rounded p-6 text-center">
            <Play className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-700 mb-3">External Video Platform</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Video</span>
            </a>
          </div>
        )
      
      default:
        return null
    }
  }

  if (isPreview) {
    // Smaller preview version for admin interface
    return (
      <div className={`${className}`}>
        {videoType === 'youtube' || videoType === 'vimeo' ? (
          <div className="relative w-full h-20 bg-gray-200 rounded overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-6 w-6 text-gray-600" />
            </div>
            {showTitle && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate">
                {videoType.charAt(0).toUpperCase() + videoType.slice(1)} Video
              </div>
            )}
          </div>
        ) : videoType === 'direct' ? (
          <video
            src={url}
            className="w-full h-20 object-cover rounded"
            preload="metadata"
            muted
          />
        ) : (
          <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
            <Play className="h-6 w-6 text-gray-600" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">
            {videoType.charAt(0).toUpperCase() + videoType.slice(1)} Video
          </span>
        </div>
      )}
      {renderVideo()}
    </div>
  )
}

export default VideoPlayer
