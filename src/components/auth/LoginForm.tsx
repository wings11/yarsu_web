'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      router.push('/')
    } catch (error: any) {
      let errorMessage = t('failedSignIn')
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = t('invalidCredentials')
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = t('emailNotConfirmed')
      } else if (error.message.includes('Too many requests')) {
        errorMessage = t('tooManyRequests')
      } else if (error.message.includes('User not found')) {
        errorMessage = t('userNotFound')
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher size="sm" className="shadow-sm" />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/images/logo.png" alt="Logo" className="h-12 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('signInAccount')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('dontHaveAccount')}{' '}
            <Link href="/signup" className="text-primary-600 hover:text-primary-500">
              {t('signUpHere')}
            </Link>
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('email')}
              />

              <Input
                label={t('password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('password')}
                showPasswordToggle={true}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p>{error}</p>
                      {(error.includes('No account found') || error === t('userNotFound')) && (
                        <p className="mt-1">
                          <Link href="/signup" className="text-red-800 underline hover:text-red-900">
                            {t('createAccount')}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                {t('login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
