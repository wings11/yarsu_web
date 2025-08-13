'use client'

import React from 'react'
import { StorageService } from '@/lib/storage'
import { 
  Download, 
  FileText, 
  Image as ImageIcon,
  ExternalLink,
  Play
} from 'lucide-react'

interface FileMessageProps {
  fileUrl: string
  fileName: string
  fileType?: string
  isOwnMessage?: boolean
}

export default function FileMessage({ 
  fileUrl, 
  fileName, 
  fileType = '',
  isOwnMessage = false 
}: FileMessageProps) {
  const getFileCategory = () => {
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (StorageService.isDocumentType(fileType)) return 'document'
    return 'file'
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openFile = () => {
    window.open(fileUrl, '_blank')
  }

  const category = getFileCategory()

  if (category === 'image') {
    return (
      <div className="max-w-xs sm:max-w-sm">
        <div className="relative group overflow-hidden rounded-lg shadow-sm">
          <img 
            src={fileUrl} 
            alt={fileName}
            className="w-full h-auto max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={openFile}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
            style={{ minHeight: '100px', backgroundColor: '#f3f4f6' }}
          />
          
          {/* Fallback for broken images */}
          <div className="hidden p-6 bg-gray-100 rounded-lg text-center min-h-[100px] items-center justify-center flex-col">
            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">Image unavailable</p>
            <button 
              onClick={openFile}
              className="text-xs text-blue-500 hover:text-blue-600 mt-1"
            >
              Try to open
            </button>
          </div>
          
          {/* Overlay on hover - only show on desktop */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 items-center justify-center opacity-0 group-hover:opacity-100 hidden sm:flex">
            <div className="flex space-x-2">
              <button
                onClick={openFile}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-sm"
                title="View full size"
              >
                <ExternalLink className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-sm"
                title="Download"
              >
                <Download className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (category === 'video') {
    return (
      <div className="max-w-xs sm:max-w-sm">
        <div className="relative group overflow-hidden rounded-lg shadow-sm">
          <video 
            src={fileUrl}
            className="w-full h-auto max-h-80 object-cover rounded-lg"
            controls
            preload="metadata"
            style={{ minHeight: '120px', backgroundColor: '#f3f4f6' }}
            onError={(e) => {
              // Fallback if video fails to load
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          >
            Your browser does not support the video tag.
          </video>
          
          {/* Fallback for broken videos */}
          <div className="hidden p-6 bg-gray-100 rounded-lg text-center cursor-pointer min-h-[120px] items-center justify-center flex-col" onClick={openFile}>
            <Play className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-500 mb-1">Video unavailable</p>
            <p className="text-xs text-blue-500 hover:text-blue-600">Click to try opening</p>
          </div>
          
          {/* Download overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="p-1.5 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all shadow-sm"
              title="Download video"
            >
              <Download className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Document/File display
  return (
    <div className={`
      flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors max-w-xs sm:max-w-sm
      ${isOwnMessage ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}
    `}>
      {/* File Icon */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
        ${isOwnMessage ? 'bg-blue-100' : 'bg-gray-100'}
      `}>
        <FileText className={`h-5 w-5 ${isOwnMessage ? 'text-blue-600' : 'text-gray-600'}`} />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {fileName}
        </p>
        <p className="text-xs text-gray-500 capitalize">
          {category} file
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex space-x-1">
        <button
          onClick={openFile}
          className={`
            p-1.5 rounded-md transition-colors
            ${isOwnMessage 
              ? 'hover:bg-blue-200 text-blue-600' 
              : 'hover:bg-gray-200 text-gray-600'
            }
          `}
          title="Open file"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
        <button
          onClick={handleDownload}
          className={`
            p-1.5 rounded-md transition-colors
            ${isOwnMessage 
              ? 'hover:bg-blue-200 text-blue-600' 
              : 'hover:bg-gray-200 text-gray-600'
            }
          `}
          title="Download file"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
