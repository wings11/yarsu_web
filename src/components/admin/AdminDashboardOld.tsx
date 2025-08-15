'use client'

import React, { useState, useEffect } from 'react'
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
  Plane
} from 'lucide-react'
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
import { Button } from '@/components/ui/Button'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // Get saved tab from localStorage or default to 'analytics'
  const getSavedTab = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_active_tab') || 'analytics'
    }
    return 'analytics'
  }
  
  const [activeTab, setActiveTab] = useState(getSavedTab())
  const [hasShownReturnMessage, setHasShownReturnMessage] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
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
    }
  }, [hasShownReturnMessage])
  
  // Save active tab to localStorage whenever it changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_active_tab', tabId)
    }
  }

  const adminTabs = [
    { id: 'analytics', name: t('analytics'), icon: BarChart3, description: t('viewPlatformStatistics'), color: 'bg-blue-50 text-blue-600' },
    { id: 'posts', name: t('generalPosts'), icon: FileText, description: t('manageGeneralPosts'), color: 'bg-purple-50 text-purple-600' },
    { id: 'jobs', name: t('jobs'), icon: Briefcase, description: t('manageJobPostings'), color: 'bg-green-50 text-green-600' },
    { id: 'hotels', name: t('hotels'), icon: Hotel, description: t('manageHotelListings'), color: 'bg-orange-50 text-orange-600' },
    { id: 'restaurants', name: t('restaurants'), icon: Utensils, description: t('manageRestaurantListings'), color: 'bg-red-50 text-red-600' },
    { id: 'condos', name: t('condos'), icon: Home, description: t('manageCondoRentals'), color: 'bg-indigo-50 text-indigo-600' },
    { id: 'travel', name: t('travel'), icon: Plane, description: t('manageTravelPackages'), color: 'bg-cyan-50 text-cyan-600' },
    { id: 'courses', name: t('courses'), icon: GraduationCap, description: t('manageEducationalCourses'), color: 'bg-pink-50 text-pink-600' },
    { id: 'docs', name: t('documents'), icon: FileText, description: t('manageDocuments'), color: 'bg-gray-50 text-gray-600' },
  ]

  const superAdminTabs = [
    { id: 'users', name: t('userManagement'), icon: Users, description: t('promoteUsers'), color: 'bg-purple-50 text-purple-600' },
    { id: 'links', name: t('socialLinks'), icon: Link, description: t('manageSocialLinks'), color: 'bg-blue-50 text-blue-600' },
    { id: 'highlights', name: t('highlights'), icon: Star, description: t('manageHomepageSlideshow'), color: 'bg-yellow-50 text-yellow-600' },
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="hidden lg:block px-6 py-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isSuperAdmin ? 'Super Admin Panel' : 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  handleTabChange(tab.id)
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${tab.color} border-l-4 border-current shadow-sm`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`h-5 w-5 mr-3 ${
                  activeTab === tab.id ? 'text-current' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 hidden lg:block">
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="hidden lg:block px-6 py-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {availableTabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {availableTabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Welcome back, <span className="font-medium">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
