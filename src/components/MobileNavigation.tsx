'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { 
  Home, 
  MessageCircle, 
  Building,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  Link as LinkIcon,
  Menu,
  X,
  Plus,
  Settings,
  Star
} from 'lucide-react'

interface MobileNavigationProps {
  unreadCount?: number
  navigation?: Array<{
    name: string
    href: string
    icon: any
    adminOnly?: boolean
  }>
}

export default function MobileNavigation({ 
  unreadCount = 0, 
  navigation = []
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  const toggleMenu = () => setIsOpen(!isOpen)

  // Use passed navigation or create default with translations
  const navItems = navigation.length > 0 ? navigation : [
    { name: t('home'), href: '/', icon: Home },
    { name: t('chat'), href: '/chat', icon: MessageCircle },
    { name: t('jobs'), href: '/jobs', icon: Briefcase },
    { name: t('docs'), href: '/docs', icon: FileText },
    { name: t('travel'), href: '/travel', icon: MapPin },
    { name: t('hotels'), href: '/hotels', icon: Building },
    { name: t('general'), href: '/general', icon: Star },
    { name: t('condos'), href: '/condos', icon: Building },
    { name: t('restaurants'), href: '/restaurants', icon: MapPin },
    { name: t('courses'), href: '/courses', icon: GraduationCap },
    { name: t('links'), href: '/links', icon: LinkIcon },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Expandable Menu */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 lg:hidden">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 px-2 max-h-96 overflow-y-auto">
            {/* Language switcher at the top */}
            <div className="px-2 pb-3 mb-3 border-b border-gray-100">
              <LanguageSwitcher size="sm" className="w-full justify-center" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 w-72">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const showBadge = item.name === 'Chat' && unreadCount > 0
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={toggleMenu}
                    className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative mb-2">
                      <item.icon className="h-6 w-6" />
                      {showBadge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-center">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <button
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-45' 
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white" />
          )}
        </button>
        
        {/* Unread badge on the FAB */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {/* Bottom navigation for main actions only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.href
            const showBadge = item.name === 'Chat' && unreadCount > 0
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <item.icon className="h-6 w-6" />
                  {showBadge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="mt-1 font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
