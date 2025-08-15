import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showPasswordToggle?: boolean
}

export function Input({ label, error, className = '', showPasswordToggle = false, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useLanguage()
  
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`input-field ${showPasswordToggle ? 'pr-10' : ''} ${error ? 'border-danger-500 focus:ring-danger-500' : ''} ${className}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            title={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`input-field resize-none ${error ? 'border-danger-500 focus:ring-danger-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  )
}
