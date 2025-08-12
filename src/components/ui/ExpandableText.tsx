'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExpandableTextProps {
  text: string
  maxLines?: number
  className?: string
  showMoreText?: string
  showLessText?: string
}

export default function ExpandableText({ 
  text, 
  maxLines = 2, 
  className = '',
  showMoreText = 'Show more',
  showLessText = 'Show less'
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Check if text needs truncation (rough estimation based on character count)
  // A more accurate way would be to measure actual rendered height
  const wordsPerLine = 10 // Approximate words per line
  const maxWords = maxLines * wordsPerLine
  const words = text.split(' ')
  const needsTruncation = words.length > maxWords

  const displayText = isExpanded || !needsTruncation 
    ? text 
    : words.slice(0, maxWords).join(' ') + '...'

  if (!needsTruncation) {
    return <p className={className}>{text}</p>
  }

  return (
    <div>
      <p className={className}>
        {displayText}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? showLessText : showMoreText}
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  )
}
