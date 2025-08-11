'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { PageLoader } from '@/components/ui/Loading'
import Layout from '@/components/Layout'
import { LoginForm, SignupForm } from '@/components/auth/AuthForms'
import HighlightsSlideshow from '@/components/home/HighlightsSlideshow'
import SocialLinks from '@/components/home/SocialLinks'

export default function RootPage() {
  const { user, loading } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/images/logo.png" alt="Logo" className="h-24 w-auto" />
            </div>
            <p className="text-gray-600">Your guide to Thailand</p>
          </div>
          
          {isLoginMode ? (
            <LoginForm onToggleMode={() => setIsLoginMode(false)} />
          ) : (
            <SignupForm onToggleMode={() => setIsLoginMode(true)} />
          )}
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <HomePage />
    </Layout>
  )
}

function HomePage() {
  const { t } = useLanguage()
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('welcome')}</h1>
          <p className="text-xl text-gray-600 mb-8">{t('yourGuideThailand')}</p>
        </div>

        {/* Highlights Slideshow */}
        <div className="mb-8">
          <HighlightsSlideshow />
        </div>

        {/* Social Links */}
        <div className="flex justify-center mb-8">
          <SocialLinks />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title={t('jobs')}
          description={t('findEmployment')}
          href="/jobs"
          icon="💼"
        />
          <FeatureCard
            title={t('docs')}
            description={t('importantInfo')}
            href="/docs"
            icon="📄"
          />
          <FeatureCard
            title={t('travel')}
            description={t('exploreDestinations')}
            href="/travel"
            icon="✈️"
          />
        <FeatureCard
          title={t('hotels')}
          description={t('findPerfectStay')}
          href="/hotels"
          icon="🏨"
        />
        <FeatureCard
          title={t('general')}
          description={t('generaldes')}
          href="/general"
          icon="🌟"
        />
          <FeatureCard
            title={t('condos')}
            description={t('longTermAccommodation')}
            href="/condos"
            icon="🏢"
          />
        <FeatureCard
          title={t('restaurants')}
          description={t('discoverCuisine')}
          href="/restaurants"
          icon="🍜"
        />
        <FeatureCard
          title={t('courses')}
          description={t('learnSkills')}
          href="/courses"
          icon="📚"
        />
        <FeatureCard
          title={t('links')}
          description={t('usefulResources')}
          href="/links"
          icon="🔗"
        />
        <FeatureCard
          title={t('chat')}
          description={t('getChatSupport')}
          href="/chat"
          icon="💬"
        />
      </div>
    </div>
  )
}

function FeatureCard({ 
  title, 
  description, 
  href, 
  icon 
}: { 
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </a>
  )
}
