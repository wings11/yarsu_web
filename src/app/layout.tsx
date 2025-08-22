'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools' // Hidden for production
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import BrowserOptimization from '@/components/BrowserOptimization'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import '@/styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes - much longer
      gcTime: 60 * 60 * 1000, // 1 hour - keep data in cache longer (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false, // Don't refetch when tab gains focus
      refetchOnReconnect: true, // Only refetch on network reconnect
      refetchOnMount: false, // Don't refetch when component mounts if data exists
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="YarSu - A comprehensive community platform for courses, jobs, travel, restaurants, and more" />
        <meta name="keywords" content="community, courses, jobs, travel, restaurants, chat, social" />
        <meta name="author" content="YarSu Team" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="YarSu" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="YarSu" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Favicon and Icons */}
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/images/logo.png" color="#3b82f6" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="YarSu - Community Platform" />
        <meta property="og:description" content="A comprehensive community platform for courses, jobs, travel, restaurants, and more" />
        <meta property="og:site_name" content="YarSu" />
        <meta property="og:url" content="https://yarsu.com" />
        <meta property="og:image" content="/images/logo.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="YarSu - Community Platform" />
        <meta property="twitter:description" content="A comprehensive community platform for courses, jobs, travel, restaurants, and more" />
        <meta property="twitter:image" content="/images/logo.png" />

        <title>YarSu - Community Platform</title>
      </head>
      <body className="no-select">
        <ErrorBoundary>
          <BrowserOptimization />
          <QueryClientProvider client={queryClient}>
            <LanguageProvider>
              <ToastProvider>
                <AuthProvider>
                  <ChatProvider>
                    {children}
                    <PWAInstallPrompt />
                  </ChatProvider>
                </AuthProvider>
              </ToastProvider>
            </LanguageProvider>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
