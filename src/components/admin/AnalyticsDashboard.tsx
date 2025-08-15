'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { apiService } from '@/lib/api'
import { 
  Users, 
  FileText, 
  Eye,
  Clock,
  TrendingUp,
  Settings,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
  Star,
  Loader2
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface AnalyticsStats {
  totalUsers: number
  totalPosts: number
  activeChats: number
  highlights: number
  categories: {
    jobs: number
    restaurants: number
    hotels: number
    courses: number
    condos: number
    travel: number
    general: number
    docs: number
    links: number
    highlights: number
  }
}

export default function AnalyticsDashboard() {
  const { t } = useLanguage()
  const [timeRange, setTimeRange] = useState('7d')
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [activities, setActivities] = useState<Array<{
    type: string;
    message: string;
    time: string;
    color: string;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
    // Refresh data every 30 seconds for live updates
    const interval = setInterval(fetchAnalyticsData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch analytics stats and recent activities in parallel
      const [analyticsStats, recentActivities] = await Promise.all([
        apiService.getAnalyticsStats(),
        apiService.getRecentActivity()
      ])
      
      setStats(analyticsStats)
      setActivities(recentActivities)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError('Failed to load analytics data')
      
      // Fallback activities if fetch fails
      setActivities([
        { 
          type: 'user', 
          message: 'New user registration', 
          time: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString(), 
          color: 'blue' 
        },
        { 
          type: 'post', 
          message: 'Job post created', 
          time: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(), 
          color: 'green' 
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        // Trigger navigation to users section
        localStorage.setItem('admin_active_tab', 'users')
        window.location.reload()
        break
      case 'posts':
        localStorage.setItem('admin_active_tab', 'posts')
        window.location.reload()
        break
      case 'settings':
        // Could open a settings modal or navigate to settings
        alert('Settings functionality coming soon!')
        break
      case 'export':
        handleExportReport()
        break
      default:
        break
    }
  }

  const handleExportReport = () => {
    if (!stats) return
    
    const reportData = {
      timestamp: new Date().toISOString(),
      totalUsers: stats.totalUsers,
      totalPosts: stats.totalPosts,
      activeChats: stats.activeChats,
      highlights: stats.highlights,
      categories: stats.categories
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Generate category data for pie chart from real stats
  const getCategoryData = () => {
    if (!stats) return []
    
    const colors = {
      jobs: '#3B82F6',
      restaurants: '#8B5CF6', 
      hotels: '#10B981',
      courses: '#06B6D4',
      condos: '#F59E0B',
      travel: '#EF4444',
      general: '#6366F1',
      docs: '#84CC16',
      links: '#F97316',
      highlights: '#EC4899'
    }

    return Object.entries(stats.categories)
      .filter(([_, value]) => value > 0) // Only show categories with data
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: colors[name as keyof typeof colors] || '#6B7280'
      }))
  }
  
  // Sample data for charts (we'll keep some chart data as sample since we need historical data)
  const weeklyData = [
    { name: 'Mon', users: 20, posts: 5, views: 150 },
    { name: 'Tue', users: 25, posts: 8, views: 200 },
    { name: 'Wed', users: 18, posts: 3, views: 120 },
    { name: 'Thu', users: 30, posts: 12, views: 250 },
    { name: 'Fri', users: 35, posts: 15, views: 300 },
    { name: 'Sat', users: 40, posts: 18, views: 350 },
    { name: 'Sun', users: 32, posts: 10, views: 280 }
  ]
  
  const monthlyGrowth = [
    { month: 'Jan', users: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.6) : 0, posts: stats?.totalPosts ? Math.floor(stats.totalPosts * 0.7) : 0 },
    { month: 'Feb', users: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.7) : 0, posts: stats?.totalPosts ? Math.floor(stats.totalPosts * 0.8) : 0 },
    { month: 'Mar', users: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.8) : 0, posts: stats?.totalPosts ? Math.floor(stats.totalPosts * 0.85) : 0 },
    { month: 'Apr', users: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.9) : 0, posts: stats?.totalPosts ? Math.floor(stats.totalPosts * 0.9) : 0 },
    { month: 'May', users: stats?.totalUsers ? Math.floor(stats.totalUsers * 0.95) : 0, posts: stats?.totalPosts ? Math.floor(stats.totalPosts * 0.95) : 0 },
    { month: 'Jun', users: stats?.totalUsers || 0, posts: stats?.totalPosts || 0 }
  ]

  const categoryData = getCategoryData()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading analytics data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button 
            onClick={fetchAnalyticsData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-600">No analytics data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your platform&apos;s performance and growth</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors border border-blue-200 disabled:opacity-50"
          >
            <TrendingUp className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-300" />
                <span className="text-green-300 text-sm ml-1">Active</span>
              </div>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Posts</p>
              <p className="text-3xl font-bold">{stats.totalPosts.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-blue-300" />
                <span className="text-blue-300 text-sm ml-1">All Categories</span>
              </div>
            </div>
            <FileText className="h-12 w-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Chats</p>
              <p className="text-3xl font-bold">{stats.activeChats.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <MessageCircle className="h-4 w-4 text-yellow-300" />
                <span className="text-yellow-300 text-sm ml-1">Conversations</span>
              </div>
            </div>
            <MessageCircle className="h-12 w-12 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Highlights</p>
              <p className="text-3xl font-bold">{stats.highlights.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="text-yellow-300 text-sm ml-1">Featured</span>
              </div>
            </div>
            <Star className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <div className="xl:col-span-2 bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Activity Trend</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-green-500 text-sm font-medium">+5.2% vs last week</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="users" 
                stackId="1" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="Users"
              />
              <Area 
                type="monotone" 
                dataKey="posts" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Posts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Content Distribution</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Category Legend */}
              <div className="mt-4 space-y-2">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No content data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Growth and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">6-Month Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                name="Users"
              />
              <Line 
                type="monotone" 
                dataKey="posts" 
                stroke="#10B981" 
                strokeWidth={3} 
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                name="Posts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            {activities.map((activity: {
              type: string;
              message: string;
              time: string;
              color: string;
            }, index: number) => (
              <div key={index} className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div 
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0`}
                  style={{ backgroundColor: 
                    activity.color === 'blue' ? '#3B82F6' :
                    activity.color === 'green' ? '#10B981' :
                    activity.color === 'purple' ? '#8B5CF6' :
                    activity.color === 'orange' ? '#F59E0B' :
                    '#EF4444'
                  }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors border border-gray-200">
            View All Activity
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('users')}
            className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors border border-blue-200 hover:shadow-md"
          >
            <Users className="h-5 w-5" />
            <span>Manage Users</span>
          </button>
          <button 
            onClick={() => handleQuickAction('posts')}
            className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors border border-green-200 hover:shadow-md"
          >
            <FileText className="h-5 w-5" />
            <span>Create Post</span>
          </button>
          <button 
            onClick={() => handleQuickAction('settings')}
            className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors border border-purple-200 hover:shadow-md"
          >
            <Settings className="h-5 w-5" />
            <span>System Settings</span>
          </button>
          <button 
            onClick={() => handleQuickAction('export')}
            className="flex items-center justify-center space-x-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-3 px-4 rounded-lg transition-colors border border-orange-200 hover:shadow-md"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}
