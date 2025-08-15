'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExpandableCardProps {
  children: React.ReactNode
  expandedContent?: React.ReactNode
  className?: string
  expandedClassName?: string
  expandOnClick?: boolean
  isExpanded?: boolean
  onToggle?: (expanded: boolean) => void
  animationDuration?: number
}

export default function ExpandableCard({
  children,
  expandedContent,
  className = '',
  expandedClassName = '',
  expandOnClick = true,
  isExpanded: controlledExpanded,
  onToggle,
  animationDuration = 0.3
}: ExpandableCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded
  
  const toggleExpanded = () => {
    const newExpanded = !isExpanded
    if (onToggle) {
      onToggle(newExpanded)
    } else {
      setInternalExpanded(newExpanded)
    }
  }

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      layout
      transition={{ duration: animationDuration, ease: "easeInOut" }}
    >
      <motion.div
        className={expandOnClick ? 'cursor-pointer' : ''}
        onClick={expandOnClick ? toggleExpanded : undefined}
        whileHover={expandOnClick ? { scale: 1.02 } : {}}
        whileTap={expandOnClick ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
      >
        {children}
        
        {/* Expand/Collapse indicator */}
        {expandOnClick && (
          <motion.div
            className="flex justify-center py-2"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: animationDuration }}
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && expandedContent && (
          <motion.div
            className={`${expandedClassName}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: animationDuration,
              ease: "easeInOut"
            }}
            style={{ overflow: 'hidden' }}
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: animationDuration, delay: 0.1 }}
            >
              {expandedContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Preset variant for common use cases
export function QuickExpandCard({
  title,
  subtitle,
  content,
  expandedContent,
  className = ''
}: {
  title: string
  subtitle?: string
  content?: React.ReactNode
  expandedContent?: React.ReactNode
  className?: string
}) {
  return (
    <ExpandableCard
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
      expandedClassName="border-t border-gray-100 bg-gray-50"
      expandedContent={expandedContent}
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
        )}
        {content && (
          <div className="text-gray-700">{content}</div>
        )}
      </div>
    </ExpandableCard>
  )
}
