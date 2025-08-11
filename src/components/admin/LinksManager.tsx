'use client'

import React, { useState } from 'react'
import { useLinks } from '@/hooks/useApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Calendar, Plus, Edit, Trash2, Link, ExternalLink, X } from 'lucide-react'
import type { Link as LinkItem } from '@/lib/supabase'

export default function LinksManager() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const { data: links, isLoading } = useLinks()
  const queryClient = useQueryClient()

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: async (linkData: { platform: string; url: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkData)
      })
      if (!response.ok) throw new Error('Failed to create link')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
      setIsCreating(false)
    }
  })

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: number) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/links/${linkId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete link')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Links Management</h2>
          <p className="text-gray-600">Manage important links and resources</p>
          <div className="mt-1 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-1 inline-block">
            ⚡ Superadmin Only
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Link</span>
        </Button>
      </div>

      {/* Create/Edit Link Form */}
      {(isCreating || editingLink) && (
        <LinkForm
          link={editingLink}
          onSave={(linkData) => {
            if (editingLink) {
              // Update logic here
            } else {
              createLinkMutation.mutate(linkData)
            }
          }}
          onCancel={() => {
            setIsCreating(false)
            setEditingLink(null)
          }}
          isLoading={createLinkMutation.isPending}
        />
      )}

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links?.map((link: LinkItem) => (
          <div key={link.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <Link className="h-5 w-5 text-primary-600" />
                  <span className="text-sm text-gray-500">
                    {new Date(link.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLink(link)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLinkMutation.mutate(link.id)}
                    disabled={deleteLinkMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {link.platform}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {link.url}
              </p>
              
              <div className="space-y-3">
                <div className="text-sm text-gray-500 truncate">
                  <span className="font-medium">URL:</span> {link.url}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!links || links.length === 0) && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Link className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No links yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by adding your first important link.
          </p>
        </div>
      )}
    </div>
  )
}

// Link Form Component
function LinkForm({ 
  link, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  link?: LinkItem | null
  onSave: (data: { platform: string; url: string }) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [platform, setPlatform] = useState(link?.platform || '')
  const [url, setUrl] = useState(link?.url || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!platform.trim() || !url.trim()) return
    
    // Basic URL validation
    try {
      new URL(url)
    } catch {
      alert('Please enter a valid URL')
      return
    }

    onSave({
      platform: platform.trim(),
      url: url.trim()
    })
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">
        {link ? 'Edit Link' : 'Create New Link'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform *
          </label>
          <Input
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="Enter platform name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL *
          </label>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />
        </div>

        {/* URL Preview */}
        {url && (
          <div className="bg-white border border-gray-200 rounded-md p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ExternalLink className="h-4 w-4" />
              <span>Preview:</span>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 truncate"
              >
                {url}
              </a>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button type="submit" disabled={isLoading || !platform.trim() || !url.trim()}>
            {isLoading ? 'Saving...' : link ? 'Update Link' : 'Create Link'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
