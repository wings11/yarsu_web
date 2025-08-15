'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  FileText, 
  Link, 
  Star, 
  Building, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  MessageCircle,
  Upload,
  Settings,
  BarChart3,
  Hotel,
  Utensils,
  Home,
  Plane,
  TrendingUp,
  Eye,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import UserManagement from './UserManagement'
import GeneralPostManager from './GeneralPostManager'
import DocsManager from './DocsManager'
import LinksManager from './LinksManager'
import HighlightsManager from './HighlightsManager'
import JobsManager from './JobsManager'
import HotelsManager from './HotelsManager'
import RestaurantsManager from './RestaurantsManager'
import CondosManager from './CondosManager'
import CoursesManager from './CoursesManager'
import TravelManager from './TravelManager'
import AnalyticsDashboard from './AnalyticsDashboard'

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // Get saved tab from localStorage or default to 'posts'
  const getSavedTab = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_active_tab') || 'posts'
    }
    return 'posts'
  }
  
  // Get saved sidebar state from localStorage
  const getSavedSidebarState = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true'
    }
    return false
  }
  
  const [activeTab, setActiveTab] = useState(getSavedTab())
  const [hasShownReturnMessage, setHasShownReturnMessage] = useState(false)
  
  // Show a subtle message when returning to a saved tab (only once per session)
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasShownReturnMessage) {
      const savedTab = localStorage.getItem('admin_active_tab')
      if (savedTab && savedTab !== 'posts') {
        // Only show message if returning to a non-default tab
        setHasShownReturnMessage(true)
        // Optional: Show a subtle toast or notification
        console.log(`Returned to ${savedTab} section`)
      }
      
      // Initialize sidebar state
      setSidebarCollapsed(getSavedSidebarState())
    }
  }, [hasShownReturnMessage])
  
  // Toggle sidebar and save state
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_sidebar_collapsed', String(newState))
    }
  }
  
  // Save active tab to localStorage whenever it changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_active_tab', tabId)
    }
  }

  const adminTabs = [
    { id: 'jobs', name: t('jobs'), icon: Briefcase, description: t('manageJobPostings'), color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { id: 'docs', name: t('documents'), icon: FileText, description: t('manageDocuments'), color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
    { id: 'travel', name: t('travel'), icon: Plane, description: t('manageTravelPackages'), color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
    { id: 'hotels', name: t('hotels'), icon: Hotel, description: t('manageHotelListings'), color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
    { id: 'posts', name: t('generalPosts'), icon: FileText, description: t('manageGeneralPosts'), color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
    { id: 'restaurants', name: t('restaurants'), icon: Utensils, description: t('manageRestaurantListings'), color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
    { id: 'condos', name: t('condos'), icon: Home, description: t('manageCondoRentals'), color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
    { id: 'courses', name: t('courses'), icon: GraduationCap, description: t('manageEducationalCourses'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { id: 'analytics', name: t('analytics'), icon: BarChart3, description: t('viewPlatformStatistics'), color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ]

  const superAdminTabs = [
    { id: 'users', name: t('userManagement'), icon: Users, description: t('promoteUsers'), color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
    { id: 'links', name: t('socialLinks'), icon: Link, description: t('manageSocialLinks'), color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
    { id: 'highlights', name: t('highlights'), icon: Star, description: t('manageHomepageSlideshow'), color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
  ]
  
  // Check if user has admin permissions
  if (!user?.role || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 md:h-16 md:w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-red-900 mb-2">{t('accessDenied')}</h1>
            <p className="text-sm md:text-base text-red-700 mb-4">
              {t('needAdminPrivileges')}
            </p>
            <div className="bg-white rounded-md p-3 md:p-4 border border-red-200 text-left">
              <p className="text-xs md:text-sm text-gray-600 mb-2">
                <strong>{t('currentRole')}:</strong> {user?.role || 'Not assigned'}
              </p>
              <p className="text-xs md:text-sm text-gray-600 mb-2 break-all">
                <strong>{t('email')}:</strong> {user?.email}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {t('contactAdmin')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const isSuperAdmin = user?.role === 'superadmin'
  const availableTabs = isSuperAdmin 
    ? [...adminTabs, ...superAdminTabs] 
    : adminTabs

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />
      case 'posts':
        return <GeneralPostManager />
      case 'docs':
        return <DocsManager />
      case 'jobs':
        return <JobsManager />
      case 'hotels':
        return <HotelsManager />
      case 'restaurants':
        return <RestaurantsManager />
      case 'condos':
        return <CondosManager />
      case 'courses':
        return <CoursesManager />
      case 'travel':
        return <TravelManager />
      case 'links':
        return <LinksManager />
      case 'highlights':
        return <HighlightsManager />
      case 'analytics':
        return <AnalyticsDashboard />
      default:
        return <div>{t('selectTabToStart')}</div>
    }
  }

  return (
    <div className="relative">
      {/* Sidebar Overlay for Mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg border-r transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center space-x-2">
            <Image 
              src="/images/logo.png" 
              alt="YarSu Logo" 
              width={24} 
              height={24} 
              className="rounded"
            />
            <span className="font-bold text-lg">Admin Menu</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded hover:bg-gray-100">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col space-y-2 p-4">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { handleTabChange(tab.id); setSidebarOpen(false); }}
              className={`flex items-center space-x-3 py-3 px-3 rounded-lg border text-left font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id 
                  ? tab.color 
                  : 'text-gray-700 hover:bg-gray-50 border-transparent'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:block fixed top-0 left-0 z-40 h-full bg-white shadow-lg border-r transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-72'
      }`}>
        <div className={`flex items-center px-4 py-4 border-b bg-gradient-to-r ${
          sidebarCollapsed ? 'justify-center' : 'space-x-3 px-6'
        }`}>
          <Image 
            src="/images/logo.png" 
            alt="YarSu Logo" 
            width={sidebarCollapsed ? 32 : 60} 
            height={sidebarCollapsed ? 32 : 60} 
            className="rounded-lg flex items-center"
          />
          {!sidebarCollapsed && (
            <span className="font-bold text-xl text-black">Dashboard</span>
          )}
        </div>
        
        {/* Toggle Button */}
        <div className="flex justify-center py-2 border-b">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
        
        <nav className="flex flex-col space-y-2 p-4">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center py-3 px-4 rounded-lg border text-left font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id 
                  ? `${tab.color} shadow-sm border` 
                  : 'text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200'
              } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
              title={sidebarCollapsed ? tab.name : ''}
            >
              <tab.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <div>
                  <span className="block">{tab.name}</span>
                  {/* Hide description on tablet/medium screens, show on large screens */}
                  <span className="text-xs opacity-75 hidden lg:block">{tab.description}</span>
                </div>
              )}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}`}>
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {isSuperAdmin ? t('superAdminDashboard') : t('adminDashboard')}
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  {t('welcomeBack')}, {user?.email}. {t('managePlatform')}
                </p>
              </div>
              {/* Sidebar Button for Mobile */}
              <div className="md:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded border border-gray-300 bg-white shadow hover:bg-gray-50 focus:outline-none"
                  aria-label="Open admin menu"
                >
                  <Menu className="h-6 w-6 text-primary-600" />
                </button>
              </div>
              {/* Current Tab Indicator for Desktop */}
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Currently viewing</p>
                  <p className="text-lg font-semibold text-primary-600">
                    {availableTabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}


