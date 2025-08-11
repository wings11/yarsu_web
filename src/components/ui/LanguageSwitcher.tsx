'use client'

import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LanguageSwitcher({ className = '', size = 'md' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'my' : 'en')
  }

  const buttonSizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`
        inline-flex items-center space-x-2 rounded-md border border-gray-300 
        bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${buttonSizes[size]} ${className}
      `}
      title={language === 'en' ? 'Switch to Myanmar' : 'Switch to English'}
    >
      <Globe className={iconSizes[size]} />
      <span>{language === 'en' ? t('myanmar') : t('english')}</span>
    </button>
  )
}

export default LanguageSwitcher
