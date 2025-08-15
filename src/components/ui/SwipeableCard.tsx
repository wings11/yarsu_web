'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  className?: string
  swipeThreshold?: number
  disabled?: boolean
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className = '',
  swipeThreshold = 100,
  disabled = false
}: SwipeableCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
  const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95])
  
  // Swipe indicator opacities
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1])
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0])

  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    if (disabled) return

    const swipeDistance = Math.abs(info.offset.x)
    const swipeVelocity = Math.abs(info.velocity.x)

    if (swipeDistance > swipeThreshold || swipeVelocity > 500) {
      if (info.offset.x > 0) {
        setExitDirection('right')
        onSwipeRight?.()
      } else {
        setExitDirection('left')
        onSwipeLeft?.()
      }
    } else {
      // Snap back to center
      x.set(0)
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleTap = () => {
    if (!isDragging && !disabled) {
      onTap?.()
    }
  }

  return (
    <motion.div
      className={`relative cursor-grab active:cursor-grabbing ${className}`}
      style={{ x, rotate, opacity, scale }}
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      animate={exitDirection ? { 
        x: exitDirection === 'right' ? 1000 : -1000,
        opacity: 0,
        scale: 0.8
      } : {}}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.98 
      }}
    >
      {children}
      
      {/* Swipe indicators */}
      {isDragging && (
        <>
          <motion.div
            className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center rounded-lg pointer-events-none"
            style={{ 
              opacity: rightIndicatorOpacity
            }}
          >
            <div className="text-green-600 font-bold text-2xl">✓</div>
          </motion.div>
          
          <motion.div
            className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center rounded-lg pointer-events-none"
            style={{ 
              opacity: leftIndicatorOpacity
            }}
          >
            <div className="text-red-600 font-bold text-2xl">✗</div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
