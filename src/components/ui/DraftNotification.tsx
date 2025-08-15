'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { FileText, X, RotateCcw } from 'lucide-react'

interface DraftNotificationProps {
  isVisible: boolean
  onRestore: () => void
  onDiscard: () => void
  formType: string
}

export function DraftNotification({ 
  isVisible, 
  onRestore, 
  onDiscard, 
  formType 
}: DraftNotificationProps) {
  if (!isVisible) return null

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900">
            Draft Found
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            You have unsaved changes for this {formType}. Would you like to restore them?
          </p>
          <div className="flex space-x-2 mt-3">
            <Button
              size="sm"
              onClick={onRestore}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restore Draft
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDiscard}
              className="text-blue-600 border border-blue-600 hover:bg-blue-50"
            >
              <X className="h-4 w-4 mr-1" />
              Start Fresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DraftNotification
