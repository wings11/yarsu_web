'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SwipeableCard from './SwipeableCard'

interface CardStackProps<T> {
  items: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  onSwipeLeft?: (item: T, index: number) => void
  onSwipeRight?: (item: T, index: number) => void
  onCardTap?: (item: T, index: number) => void
  maxVisible?: number
  className?: string
  stackOffset?: number
  scaleStep?: number
}

export default function CardStack<T>({
  items,
  renderCard,
  onSwipeLeft,
  onSwipeRight,
  onCardTap,
  maxVisible = 3,
  className = '',
  stackOffset = 8,
  scaleStep = 0.05
}: CardStackProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipedItems, setSwipedItems] = useState<Set<number>>(new Set())

  const handleSwipeLeft = useCallback((index: number) => {
    const item = items[index]
    onSwipeLeft?.(item, index)
    setSwipedItems(prev => new Set(prev.add(index)))
    setCurrentIndex(prev => prev + 1)
  }, [items, onSwipeLeft])

  const handleSwipeRight = useCallback((index: number) => {
    const item = items[index]
    onSwipeRight?.(item, index)
    setSwipedItems(prev => new Set(prev.add(index)))
    setCurrentIndex(prev => prev + 1)
  }, [items, onSwipeRight])

  const handleCardTap = useCallback((index: number) => {
    const item = items[index]
    onCardTap?.(item, index)
  }, [items, onCardTap])

  const visibleCards = items.slice(currentIndex, currentIndex + maxVisible)
  const remainingCount = Math.max(0, items.length - currentIndex)

  if (remainingCount === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            All done!
          </h3>
          <p className="text-gray-600">
            You&apos;ve browsed through all available items.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Stack container */}
      <div className="relative h-96 w-full max-w-sm mx-auto">
        <AnimatePresence>
          {visibleCards.map((item, stackIndex) => {
            const actualIndex = currentIndex + stackIndex
            const zIndex = maxVisible - stackIndex
            const scale = 1 - (stackIndex * scaleStep)
            const y = stackIndex * stackOffset
            const isTopCard = stackIndex === 0

            return (
              <motion.div
                key={actualIndex}
                className="absolute inset-0"
                style={{ zIndex }}
                initial={{ 
                  scale: scale - 0.1, 
                  y: y + 20,
                  opacity: 0
                }}
                animate={{ 
                  scale, 
                  y,
                  opacity: 1
                }}
                exit={{ 
                  scale: 0.8, 
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }}
              >
                <SwipeableCard
                  onSwipeLeft={() => handleSwipeLeft(actualIndex)}
                  onSwipeRight={() => handleSwipeRight(actualIndex)}
                  onTap={() => handleCardTap(actualIndex)}
                  disabled={!isTopCard}
                  className="w-full h-full"
                >
                  {renderCard(item, actualIndex)}
                </SwipeableCard>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {currentIndex + 1} of {items.length}
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentIndex + 1) / items.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Action hints */}
      <div className="mt-4 flex justify-center space-x-8 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 font-bold">←</span>
          </div>
          <span>Pass</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-bold">→</span>
          </div>
          <span>Interested</span>
        </div>
      </div>
    </div>
  )
}
