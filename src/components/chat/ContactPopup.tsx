'use client'

import React from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// Social media icons as SVG components
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const LineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
)

const MessengerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
  </svg>
)

interface ContactPopupProps {
  isOpen: boolean
  onClose: () => void
  // Contact links - these can be configured
  telegramLink?: string
  lineLink?: string
  messengerLink?: string
}

export default function ContactPopup({ 
  isOpen, 
  onClose,
  telegramLink = 'https://t.me/your_telegram',  // Default - update with actual link
  lineLink = 'https://line.me/ti/p/your_line_id',  // Default - update with actual link
  messengerLink = 'https://m.me/your_facebook_page'  // Default - update with actual link
}: ContactPopupProps) {
  const { t } = useLanguage()

  if (!isOpen) return null

  const contactOptions = [
    {
      name: 'Telegram',
      icon: TelegramIcon,
      link: telegramLink,
      color: 'bg-[#0088cc] hover:bg-[#0077b5]',
      description: t('contactViaTelegram') || 'Chat with us on Telegram'
    },
    {
      name: 'LINE',
      icon: LineIcon,
      link: lineLink,
      color: 'bg-[#00B900] hover:bg-[#00a000]',
      description: t('contactViaLine') || 'Chat with us on LINE'
    },
    {
      name: 'Messenger',
      icon: MessengerIcon,
      link: messengerLink,
      color: 'bg-gradient-to-r from-[#00B2FF] to-[#006AFF] hover:from-[#0099e6] hover:to-[#0055cc]',
      description: t('contactViaMessenger') || 'Chat with us on Messenger'
    }
  ]

  const handleContactClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('contactAdminPopup') || 'Contact Admin'}
          </h2>
          <p className="text-gray-500 mt-2">
            {t('contactAdminDescription') || 'Choose your preferred platform to get in touch with us'}
          </p>
        </div>

        {/* Contact Options */}
        <div className="space-y-3">
          {contactOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleContactClick(option.link)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${option.color}`}
            >
              <div className="flex-shrink-0">
                <option.icon />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-lg">{option.name}</div>
                <div className="text-sm opacity-90">{option.description}</div>
              </div>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {t('contactAvailability') || 'We typically respond within 24 hours'}
        </div>
      </div>
    </div>
  )
}
