'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExpandableCardProps {
  children: React.ReactNode
  expandedContent: React.ReactNode
  className?: string
  expandedClassName?: string
  expandLabel?: string
  collapseLabel?: string
  defaultExpanded?: boolean
  showArrow?: boolean
  onExpandChange?: (expanded: boolean) => void
}

export default function ExpandableCard({
  children,
  expandedContent,
  className = '',
  expandedClassName = '',
  expandLabel = 'View Details',
  collapseLabel = 'Show Less',
  defaultExpanded = false,
  showArrow = true,
  onExpandChange
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onExpandChange?.(newExpanded)
  }

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
      layout
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Main content */}
      <motion.div
        className="relative"
        whileTap={{ scale: 0.98 }}
      >
        {children}
        
        {/* Expand/Collapse button */}
        <motion.button
          onClick={handleToggle}
          className="absolute bottom-4 right-4 bg-primary-600 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg hover:bg-primary-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{isExpanded ? collapseLabel : expandLabel}</span>
          {showArrow && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: 'easeInOut',
              opacity: { duration: 0.2 }
            }}
            className={`border-t border-gray-100 ${expandedClassName}`}
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-6"
            >
              {expandedContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
