'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { PageLoader } from '@/components/ui/Loading'
import Layout from '@/components/Layout'
import { LoginForm, SignupForm } from '@/components/auth/AuthForms'
import HighlightsSlideshow from '@/components/home/HighlightsSlideshow'
import SocialLinks from '@/components/home/SocialLinks'
import ParallaxContainer from '@/components/ui/animations/ParallaxContainer'
import { 
  FadeInUp, 
  FadeInScale, 
  StaggeredList, 
  StaggeredItem, 
  FloatingElement 
} from '@/components/ui/animations/MicroAnimations'

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
      {/* Hero Section with Parallax */}
      <div className="mb-12">
        <ParallaxContainer className="text-center mb-8" speed={0.3}>
          <FadeInUp>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('welcome')}</h1>
            <p className="text-xl text-gray-600 mb-8">{t('yourGuideThailand')}</p>
          </FadeInUp>
        </ParallaxContainer>

        {/* Highlights Slideshow with Parallax */}
        <ParallaxContainer className="mb-8" speed={0.2}>
          <FadeInScale delay={0.3}>
            <HighlightsSlideshow />
          </FadeInScale>
        </ParallaxContainer>

        {/* Social Links with Float Animation */}
        <FadeInUp delay={0.5} className="flex justify-center mb-8">
          <FloatingElement>
            <SocialLinks />
          </FloatingElement>
        </FadeInUp>
      </div>

      {/* Services Grid with Staggered Animation */}
      <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StaggeredItem>
          <FeatureCard
            title={t('jobs')}
            description={t('findEmployment')}
            href="/jobs"
            icon="💼"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('docs')}
            description={t('importantInfo')}
            href="/docs"
            icon="📄"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('travel')}
            description={t('exploreDestinations')}
            href="/travel"
            icon="✈️"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('hotels')}
            description={t('findPerfectStay')}
            href="/hotels"
            icon="🏨"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('general')}
            description={t('generaldes')}
            href="/general"
            icon="🌟"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('condos')}
            description={t('longTermAccommodation')}
            href="/condos"
            icon="🏢"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('restaurants')}
            description={t('discoverCuisine')}
            href="/restaurants"
            icon="🍜"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('courses')}
            description={t('learnSkills')}
            href="/courses"
            icon="📚"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('links')}
            description={t('usefulResources')}
            href="/links"
            icon="🔗"
          />
        </StaggeredItem>
        <StaggeredItem>
          <FeatureCard
            title={t('chat')}
            description={t('getChatSupport')}
            href="/chat"
            icon="💬"
          />
        </StaggeredItem>
      </StaggeredList>
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
      className="block group"
    >
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </a>
  )
}
