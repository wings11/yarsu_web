'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Shield, User, Crown } from 'lucide-react'

interface UserData {
  id: string
  email: string
  role: 'member' | 'admin' | 'superadmin'
  created_at?: string
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  // Fetch all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .order('email', { ascending: true })
      
      if (error) throw error
      return data as UserData[]
    }
  })

  // Promote user mutation
  const promoteUserMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: 'admin' | 'member' }) => {
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
      
      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  const handleRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'member' ? 'admin' : 'member'
    promoteUserMutation.mutate({ userId, newRole })
  }

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading users: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm md:text-base text-gray-600">Promote or demote users between member and admin roles</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List - Mobile Cards / Desktop Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Mobile View */}
        <div className="md:hidden">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 break-all">
                      {user.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {user.id.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'superadmin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : user.role === 'admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'superadmin' && <Crown className="h-3 w-3 mr-1" />}
                  {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                  {user.role === 'member' && <User className="h-3 w-3 mr-1" />}
                  {user.role}
                </span>
                
                {user.role !== 'superadmin' ? (
                  <Button
                    onClick={() => handleRoleChange(user.id, user.role)}
                    disabled={promoteUserMutation.isPending}
                    size="sm"
                    variant={user.role === 'admin' ? 'secondary' : 'primary'}
                  >
                    {promoteUserMutation.isPending ? 'Updating...' : 
                      user.role === 'admin' ? 'Demote' : 'Promote'
                    }
                  </Button>
                ) : (
                  <span className="text-xs text-gray-500">Cannot modify</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'superadmin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'superadmin' && <Crown className="h-3 w-3 mr-1" />}
                      {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                      {user.role === 'member' && <User className="h-3 w-3 mr-1" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== 'superadmin' && (
                      <Button
                        onClick={() => handleRoleChange(user.id, user.role)}
                        disabled={promoteUserMutation.isPending}
                        size="sm"
                        variant={user.role === 'admin' ? 'secondary' : 'primary'}
                      >
                        {promoteUserMutation.isPending ? 'Updating...' : 
                          user.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'
                        }
                      </Button>
                    )}
                    {user.role === 'superadmin' && (
                      <span className="text-sm text-gray-500">Cannot modify</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <User className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms.
          </p>
        </div>
      )}
    </div>
  )
}
