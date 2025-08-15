'use client'

import { useState, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
]

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact'
  className?: string
}

export default function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      const language = languages.find(lang => lang.code === savedLanguage)
      if (language) {
        setCurrentLanguage(language)
      }
    }
  }, [])

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem('preferred-language', language.code)
    setIsOpen(false)
    
    // You can add actual language change logic here
    // For example, updating i18n or context
    console.log('Language changed to:', language.code)
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Change Language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{currentLanguage.flag}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px]">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    currentLanguage.code === language.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-sm">{language.flag}</span>
                  <span className="text-sm font-medium">{language.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-colors shadow-sm min-w-[140px]"
      >
        <Globe className="h-5 w-5 text-gray-600" />
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-gray-700">{currentLanguage.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-full">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLanguage.code === language.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {currentLanguage.code === language.code && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
