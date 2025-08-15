'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react'

interface CardStackProps {
  items: any[]
  renderCard: (item: any, index: number) => React.ReactNode
  className?: string
}

export default function CardStack({ items, renderCard, className = '' }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showSwipeHint, setShowSwipeHint] = useState(true)

  // Hide swipe hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
      setShowSwipeHint(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
      setShowSwipeHint(false)
    }
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50
    const swipeVelocityThreshold = 500

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0) {
        handlePrevious()
      } else {
        handleNext()
      }
    }
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    setShowSwipeHint(false)
  }

  if (!items.length) return null

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Card container */}
      <div className="relative overflow-hidden rounded-lg scrollbar-hide" style={{ minHeight: 'auto' }}>
        {/* Swipe hint overlay */}
        {showSwipeHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            {/* Black overlay background */}
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg" />
            
            {/* Swipe hint content */}
            <div className="relative flex flex-col items-center space-y-4">
              {/* Swipe gesture visualization */}
              <div className="flex items-center space-x-6">
                {/* Left swipe icon */}
                <motion.div
                  animate={{ x: [-10, 0, -10] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center space-x-2 text-white opacity-80"
                >
                  <ChevronLeft className="h-8 w-8" />
                  <span className="text-sm">Previous</span>
                </motion.div>

                {/* Central hand/swipe icon */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white bg-opacity-20 p-4 rounded-full"
                >
                  <Hand className="h-8 w-8 text-white" />
                </motion.div>

                {/* Right swipe icon */}
                <motion.div
                  animate={{ x: [10, 0, 10] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center space-x-2 text-white opacity-80"
                >
                  <span className="text-sm">Next</span>
                  <ChevronRight className="h-8 w-8" />
                </motion.div>
              </div>

              {/* Swipe hint text */}
              <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                Swipe to browse
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing scrollbar-hide"
          >
            <div className="w-full scrollbar-hide overflow-hidden">
              {renderCard(items[currentIndex], currentIndex)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
