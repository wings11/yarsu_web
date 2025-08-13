'use client'

import React from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import { isValidUrl, ensureProtocol, getDomainFromUrl } from '@/utils/urlUtils'

interface SmartLinkProps {
  text: string
  className?: string
  showIcon?: boolean
  iconType?: 'external' | 'location'
  fallbackText?: string
}

/**
 * SmartLink component that renders clickable links for URLs and regular text otherwise
 */
export function SmartLink({ 
  text, 
  className = '', 
  showIcon = true, 
  iconType = 'external',
  fallbackText
}: SmartLinkProps) {
  if (!text) {
    return fallbackText ? <span className={className}>{fallbackText}</span> : null
  }

  const isUrl = isValidUrl(text)
  const Icon = iconType === 'location' ? MapPin : ExternalLink

  if (isUrl) {
    const fullUrl = ensureProtocol(text)
    const displayText = getDomainFromUrl(text)
    
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
        title={`Open ${fullUrl} in new tab`}
      >
        {showIcon && <Icon className="h-4 w-4 flex-shrink-0" />}
        <span className="truncate">{displayText}</span>
      </a>
    )
  }

  // Regular text with location icon if specified
  return (
    <span className={`inline-flex items-center space-x-1 ${className}`}>
      {showIcon && iconType === 'location' && <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />}
      <span>{text}</span>
    </span>
  )
}
