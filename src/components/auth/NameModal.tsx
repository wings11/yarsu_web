'use client'

import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiService } from '@/lib/api'
import toast from 'react-hot-toast'
import { User } from 'lucide-react'

interface NameModalProps {
  isOpen: boolean
  onClose: () => void
  onNameSet: (name: string) => void
}

export default function NameModal({ isOpen, onClose, onNameSet }: NameModalProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }

    if (name.trim().length > 255) {
      toast.error('Name is too long')
      return
    }

    setIsSubmitting(true)
    
    try {
      await apiService.updateUserName(name.trim())
      toast.success('Welcome! Your name has been saved.')
      onNameSet(name.trim())
      onClose()
    } catch (error: any) {
      console.error('Error saving name:', error)
      toast.error('Failed to save name. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          <Dialog.Title className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Welcome! 👋
          </Dialog.Title>
          
          <Dialog.Description className="text-gray-600 mb-8 text-center">
            To get started, please tell us your name so we can personalize your experience.
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoFocus
                required
                disabled={isSubmitting}
                className="w-full text-lg"
                maxLength={255}
              />
              <p className="mt-2 text-sm text-gray-500">
                This will be used to identify you in the system.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || name.trim().length < 2}
              className="w-full py-3 text-lg font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-500">
            You can update your name later in your profile settings.
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
