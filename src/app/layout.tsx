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
      <body>
        <ErrorBoundary>
          <BrowserOptimization />
          <QueryClientProvider client={queryClient}>
            <LanguageProvider>
              <ToastProvider>
                <AuthProvider>
                  <ChatProvider>
                    {children}
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
