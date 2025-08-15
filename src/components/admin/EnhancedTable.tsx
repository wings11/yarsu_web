'use client'

import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, ArrowLeft, ArrowRight } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
  mobileOnly?: boolean
  desktopOnly?: boolean
}

interface EnhancedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: (keyof T | string)[]
  itemsPerPage?: number
  onRowClick?: (item: T) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export default function EnhancedTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  searchFields = [],
  itemsPerPage = 10,
  onRowClick,
  loading = false,
  emptyMessage = "No items found",
  className = ""
}: EnhancedTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Sorting function
  const handleSort = (field: keyof T | string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm && searchFields.length > 0) {
      filtered = data.filter(item =>
        searchFields.some(field => {
          const value = typeof field === 'string' && field.includes('.') 
            ? field.split('.').reduce((obj, key) => obj?.[key], item as any)
            : item[field as keyof T]
          return value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = String(sortField).includes('.') 
          ? String(sortField).split('.').reduce((obj: any, key: string) => obj?.[key], a as any)
          : a[sortField as keyof T]
        let bVal = String(sortField).includes('.') 
          ? String(sortField).split('.').reduce((obj: any, key: string) => obj?.[key], b as any)
          : b[sortField as keyof T]

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1

        // Convert to string for comparison if not already
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, searchFields, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage)

  const getSortIcon = (field: keyof T | string) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4" />
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="animate-pulse p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Search Bar */}
      {searchable && searchFields.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.filter(col => !col.mobileOnly).map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr
                key={item.id || Math.random()}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.filter(col => !col.mobileOnly).map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(item)
                      : String(String(column.key).includes('.') 
                          ? String(column.key).split('.').reduce((obj: any, key: string) => obj?.[key], item as any)
                          : item[column.key as keyof T] || ''
                        )
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {paginatedData.map((item) => (
          <div
            key={item.id || Math.random()}
            className={`p-4 border-b border-gray-200 last:border-b-0 ${
              onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
            onClick={() => onRowClick?.(item)}
          >
            {columns.filter(col => !col.desktopOnly).map((column) => (
              <div key={String(column.key)} className="mb-2 last:mb-0">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500">{column.header}:</span>
                  <div className="text-sm text-gray-900 text-right flex-1 ml-2">
                    {column.render 
                      ? column.render(item)
                      : String(String(column.key).includes('.') 
                          ? String(column.key).split('.').reduce((obj: any, key: string) => obj?.[key], item as any)
                          : item[column.key as keyof T] || ''
                        )
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>{emptyMessage}</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} of{' '}
            {filteredAndSortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                const isCurrentPage = page === currentPage
                const shouldShow = page === 1 || page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                
                if (!shouldShow) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>
                  }
                  return null
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm ${
                      isCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
