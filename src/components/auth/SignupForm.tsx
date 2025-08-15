'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import toast from 'react-hot-toast'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    
    if (password !== confirmPassword) {
      setError(t('passwordsNoMatch'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      setSuccess(true)
      // Clear form
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      // Show success message and redirect after delay
      toast.success(t('accountCreatedSuccess'))
      setTimeout(() => {
        router.push('/')
      }, 2000) // 2 second delay to show success message
    } catch (error: any) {
      let errorMessage = t('failedSignUp')
      
      if (error.message.includes('User already registered') || 
          error.message.includes('email already exists')) {
        errorMessage = t('emailAlreadyExists')
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = t('passwordTooShort')
      } else if (error.message.includes('Unable to validate email address') ||
                 error.message.includes('Invalid email')) {
        errorMessage = t('invalidEmail')
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
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
          <h2 className="text-2xl font-bold text-gray-900">{t('createAccount')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-500">
              {t('signInHere')}
            </Link>
          </p>
        </div>

        <Card>
          <CardContent>
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">{t('accountCreatedSuccess')}</p>
                    <p className="text-sm">{t('redirectingMessage')}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('email')}
                disabled={success}
              />

              <Input
                label={t('password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('password')}
                disabled={success}
                showPasswordToggle={true}
              />

              <Input
                label={t('confirmPassword')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder={t('confirmPassword')}
                disabled={success}
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
                      {(error.includes('email already exists') || error === t('emailAlreadyExists')) && (
                        <p className="mt-1">
                          <Link href="/login" className="text-red-800 underline hover:text-red-900">
                            {t('signInHere')}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                disabled={success}
              >
                {success ? t('accountCreatedSuccess') : t('signup')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
