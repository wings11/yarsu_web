'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface ParallaxContainerProps {
  children: React.ReactNode
  className?: string
  speed?: number
  offset?: number
}

export default function ParallaxContainer({
  children,
  className = '',
  speed = 0.5,
  offset = 0
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [offset, offset + (speed * 100)])
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: springY }}>
        {children}
      </motion.div>
    </div>
  )
}

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  speed?: number
  scale?: number
}

export function ParallaxImage({
  src,
  alt,
  className = '',
  speed = 0.5,
  scale = 1.1
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`])
  const scaleTransform = useTransform(scrollYProgress, [0, 1], [scale, 1])

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ 
          y,
          scale: scaleTransform
        }}
      />
    </div>
  )
}

interface ParallaxTextProps {
  children: React.ReactNode
  className?: string
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function ParallaxText({
  children,
  className = '',
  speed = 0.3,
  direction = 'up'
}: ParallaxTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const transformValue = direction === 'up' || direction === 'down' 
    ? (direction === 'up' ? [50, -50] : [-50, 50])
    : (direction === 'left' ? [50, -50] : [-50, 50])

  const transform = useTransform(scrollYProgress, [0, 1], transformValue)
  const springTransform = useSpring(transform, { stiffness: 100, damping: 30 })

  const style = direction === 'left' || direction === 'right' 
    ? { x: springTransform }
    : { y: springTransform }

  return (
    <div ref={ref} className={className}>
      <motion.div style={style}>
        {children}
      </motion.div>
    </div>
  )
}

interface ParallaxSectionProps {
  children: React.ReactNode
  backgroundImage?: string
  className?: string
  height?: string
  speed?: number
  overlay?: boolean
  overlayOpacity?: number
}

export function ParallaxSection({
  children,
  backgroundImage,
  className = '',
  height = 'h-screen',
  speed = 0.5,
  overlay = false,
  overlayOpacity = 0.5
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`])

  return (
    <div ref={ref} className={`relative overflow-hidden ${height} ${className}`}>
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            y
          }}
        />
      )}
      
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
