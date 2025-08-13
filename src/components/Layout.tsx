'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/Button'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import MobileNavigation from '@/components/MobileNavigation'
import { 
  Home, 
  MessageCircle, 
  Building,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  Link as LinkIcon,
  Star,
  User,
  Menu,
  X,
  Settings,
  LogOut
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { newMessages } = useChat()
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const unreadCount = newMessages.length
  
  // Show admin navigation for admin and superadmin users
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  
  // Create navigation with translations
  const navigation = [
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

  const adminNavigation = [
    { name: t('admin'), href: '/admin', icon: Settings, adminOnly: true },
  ]
  
  const allNavigation = isAdmin ? [...navigation, ...adminNavigation] : navigation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={allNavigation} pathname={pathname} unreadCount={unreadCount} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <SidebarContent navigation={allNavigation} pathname={pathname} unreadCount={unreadCount} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher size="sm" />
              <span className="text-sm text-gray-600">{t('welcome')}, {user?.email}</span>
              <Button variant="ghost" onClick={handleSignOut} size="sm" className="p-2" title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 pb-24 lg:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation unreadCount={unreadCount} navigation={allNavigation} />
    </div>
  )
}

function SidebarContent({ navigation, pathname, unreadCount }: { 
  navigation: any[], 
  pathname: string, 
  unreadCount: number 
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
      <div className="flex flex-shrink-0 items-center px-4">
        <img src="/images/logo.png" alt="Logo" className="h-12 w-auto" />
      </div>
      <nav className="mt-5 flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const showBadge = item.name === 'Chat' && unreadCount > 0
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="relative mr-3 flex-shrink-0">
                <item.icon className="h-6 w-6" />
                {showBadge && (
                  <span className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
