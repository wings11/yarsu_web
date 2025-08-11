'use client'

import React, { useState } from 'react'
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

export default function AdminDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('posts')

  const adminTabs = [
    { id: 'jobs', name: t('jobs'), icon: Briefcase, description: t('manageJobPostings') },
    { id: 'docs', name: t('documents'), icon: FileText, description: t('manageDocuments') },
    { id: 'travel', name: t('travel'), icon: Plane, description: t('manageTravelPackages') },
    { id: 'hotels', name: t('hotels'), icon: Hotel, description: t('manageHotelListings') },
    { id: 'posts', name: t('generalPosts'), icon: FileText, description: t('manageGeneralPosts') },
    { id: 'restaurants', name: t('restaurants'), icon: Utensils, description: t('manageRestaurantListings') },
    { id: 'condos', name: t('condos'), icon: Home, description: t('manageCondoRentals') },
    { id: 'courses', name: t('courses'), icon: GraduationCap, description: t('manageEducationalCourses') },
    { id: 'analytics', name: t('analytics'), icon: BarChart3, description: t('viewPlatformStatistics') },
  ]

  const superAdminTabs = [
    { id: 'users', name: t('userManagement'), icon: Users, description: t('promoteUsers') },
    { id: 'links', name: t('socialLinks'), icon: Link, description: t('manageSocialLinks') },
    { id: 'highlights', name: t('highlights'), icon: Star, description: t('manageHomepageSlideshow') },
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
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isSuperAdmin ? t('superAdminDashboard') : t('adminDashboard')}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {t('welcomeBack')}, {user?.email}. {t('managePlatform')}
        </p>
      </div>

      {/* Navigation Tabs - Mobile Responsive */}
      <div className="mb-6 md:mb-8">
        <div className="border-b border-gray-200">
          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {availableTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Desktop Tabs */}
          <nav className="hidden md:flex md:space-x-8 overflow-x-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        {renderTabContent()}
      </div>
    </div>
  )
}

// Simple Analytics Component
function AnalyticsDashboard() {
  const { t } = useLanguage()
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <div className="bg-blue-50 rounded-lg p-4 md:p-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm font-medium text-blue-600">{t('totalUsers')}</p>
            <p className="text-xl md:text-2xl font-bold text-blue-900">1,234</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4 md:p-6">
        <div className="flex items-center">
          <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm font-medium text-green-600">{t('activeChats')}</p>
            <p className="text-xl md:text-2xl font-bold text-green-900">28</p>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4 md:p-6">
        <div className="flex items-center">
          <FileText className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm font-medium text-purple-600">{t('postsCreated')}</p>
            <p className="text-xl md:text-2xl font-bold text-purple-900">156</p>
          </div>
        </div>
      </div>
      
      <div className="bg-orange-50 rounded-lg p-4 md:p-6">
        <div className="flex items-center">
          <Star className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
          <div className="ml-3 md:ml-4">
            <p className="text-xs md:text-sm font-medium text-orange-600">{t('highlights')}</p>
            <p className="text-xl md:text-2xl font-bold text-orange-900">12</p>
          </div>
        </div>
      </div>
    </div>
  )
}
