'use client'

import { motion, Variants } from 'framer-motion'
import React from 'react'

// Animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export const slideUp: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" }
  }
}

export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      type: "spring",
      bounce: 0.4
    }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 }
}

export const hoverLift = {
  whileHover: { y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
  transition: { duration: 0.3 }
}

export const hoverGlow = {
  whileHover: { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
  transition: { duration: 0.3 }
}

// Component wrappers for common animations
interface AnimatedProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeInUp({ children, className = '', delay = 0, duration = 0.6 }: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration, delay, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export function FadeInScale({ children, className = '', delay = 0, duration = 0.5 }: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
          opacity: 1, 
          scale: 1,
          transition: { duration, delay, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export function SlideInLeft({ children, className = '', delay = 0, duration = 0.6 }: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: { duration, delay, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export function SlideInRight({ children, className = '', delay = 0, duration = 0.6 }: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, x: 50 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: { duration, delay, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredList({ children, className = '', staggerDelay = 0.1 }: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredItem({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Interactive button with micro-animations
interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'scale' | 'lift' | 'glow' | 'bounce'
  disabled?: boolean
}

export function AnimatedButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'scale',
  disabled = false 
}: AnimatedButtonProps) {
  const getVariant = () => {
    switch (variant) {
      case 'scale':
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          transition: { duration: 0.2 }
        }
      case 'lift':
        return {
          whileHover: { y: -3, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" },
          whileTap: { y: 0 },
          transition: { duration: 0.2 }
        }
      case 'glow':
        return {
          whileHover: { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
          transition: { duration: 0.3 }
        }
      case 'bounce':
        return {
          whileHover: { scale: 1.1 },
          whileTap: { scale: 0.9 },
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }
      default:
        return {}
    }
  }

  return (
    <motion.button
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...getVariant()}
    >
      {children}
    </motion.button>
  )
}

// Loading spinner with animation
export function AnimatedSpinner({ className = '', size = 'w-8 h-8' }: {
  className?: string
  size?: string
}) {
  return (
    <motion.div
      className={`${size} border-4 border-gray-200 border-t-blue-500 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}

// Floating element animation
export function FloatingElement({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}
