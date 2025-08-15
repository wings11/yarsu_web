'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseFormPersistenceOptions<T> {
  key: string
  defaultValues: T
  autoSave?: boolean
  autoSaveDelay?: number
}

export function useFormPersistence<T extends Record<string, any>>({
  key,
  defaultValues,
  autoSave = true,
  autoSaveDelay = 1000
}: UseFormPersistenceOptions<T>) {
  const [formData, setFormData] = useState<T>(defaultValues)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load saved data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`form_draft_${key}`)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setFormData({ ...defaultValues, ...parsedData })
          setHasUnsavedChanges(true)
        } catch (error) {
          console.error('Failed to parse saved form data:', error)
        }
      }
    }
  }, [key])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return

    const timeoutId = setTimeout(() => {
      if (hasUnsavedChanges && typeof window !== 'undefined') {
        localStorage.setItem(`form_draft_${key}`, JSON.stringify(formData))
      }
    }, autoSaveDelay)

    return () => clearTimeout(timeoutId)
  }, [formData, hasUnsavedChanges, autoSave, autoSaveDelay, key])

  // Update form data
  const updateFormData = useCallback((updates: Partial<T> | ((prev: T) => T)) => {
    setFormData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
      setHasUnsavedChanges(true)
      return newData
    })
  }, [])

  // Clear saved draft
  const clearDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`form_draft_${key}`)
    }
    setHasUnsavedChanges(false)
  }, [key])

  // Reset form to defaults
  const resetForm = useCallback(() => {
    setFormData(defaultValues)
    clearDraft()
  }, [defaultValues, clearDraft])

  // Save current state as draft
  const saveDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`form_draft_${key}`, JSON.stringify(formData))
      setHasUnsavedChanges(false)
    }
  }, [formData, key])

  // Check if there's a saved draft
  const hasSavedDraft = useCallback(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`form_draft_${key}`) !== null
  }, [key])

  return {
    formData,
    updateFormData,
    resetForm,
    clearDraft,
    saveDraft,
    hasUnsavedChanges,
    hasSavedDraft: hasSavedDraft()
  }
}

export default useFormPersistence
