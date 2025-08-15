import { supabase } from './supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yarsu-backend.onrender.com' 

class ApiService {
  private async getAuthHeaders() {
    // Get token from Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` })
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = await this.getAuthHeaders()
    
    const config: RequestInit = {
      headers,
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      throw error
    }
  }

  // Chat endpoints
  async getChats() {
    return this.request('/api/chats')
  }

  async createChat(userId: string) {
    return this.request('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    })
  }

  async getMessages(chatId: number) {
    return this.request(`/api/messages/${chatId}`)
  }

  async sendMessage(message: string, chatId?: number, type: string = 'text', file?: File) {
    if (file) {
      // Send as FormData for file uploads
      const formData = new FormData()
      formData.append('message', message || '')
      formData.append('type', type)
      if (chatId) {
        formData.append('chat_id', chatId.toString())
      }
      formData.append('file', file)

      // Get token for authorization
      const { data: { session } } = await supabase.auth.getSession()
      
      return fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` })
        },
        body: formData
      }).then(response => {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        return response.json()
      })
    } else {
      // Send as JSON for text messages
      const payload = { 
        message, 
        type,
        ...(chatId && { chat_id: chatId })
      }
      return this.request('/api/messages', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    }
  }

  async replyMessage(message: string, chatId: number, type: string = 'text', file?: File) {
    if (file) {
      // Send as FormData for file uploads
      const formData = new FormData()
      formData.append('message', message || '')
      formData.append('type', type)
      formData.append('chat_id', chatId.toString())
      formData.append('file', file)

      // Get token for authorization
      const { data: { session } } = await supabase.auth.getSession()
      
      return fetch(`${API_BASE_URL}/api/reply`, {
        method: 'POST',
        headers: {
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` })
        },
        body: formData
      }).then(response => {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        return response.json()
      })
    } else {
      // Send as JSON for text messages
      return this.request('/api/reply', {
        method: 'POST',
        body: JSON.stringify({ 
          message, 
          type,
          chat_id: chatId
        })
      })
    }
  }

  // Mark messages as read
  async markMessageAsRead(messageId: number) {
    return this.request(`/api/messages/${messageId}/mark-read`, {
      method: 'POST'
    })
  }

  async markChatAsRead(chatId: number) {
    return this.request(`/api/chats/${chatId}/mark-read`, {
      method: 'POST'
    })
  }

  // Get unread counts for all chats (admin only)
  async getUnreadCounts() {
    return this.request('/api/chats/unread-counts')
  }

  // Content endpoints - these now use authenticated requests
  async getRestaurants() {
    return this.request('/api/restaurants')
  }

  async createRestaurant(restaurantData: any) {
    return this.request('/api/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurantData)
    })
  }

  async updateRestaurant(restaurantId: number, restaurantData: any) {
    return this.request(`/api/restaurants/${restaurantId}`, {
      method: 'PUT',
      body: JSON.stringify(restaurantData)
    })
  }

  async deleteRestaurant(restaurantId: number) {
    return this.request(`/api/restaurants/${restaurantId}`, {
      method: 'DELETE'
    })
  }

  async getHotels() {
    return this.request('/api/hotels')
  }

  async getJobs() {
    return this.request('/api/jobs')
  }

  async createJob(jobData: any) {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    })
  }

  async updateJob(jobId: number, jobData: any) {
    return this.request(`/api/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    })
  }

  async deleteJob(jobId: number) {
    return this.request(`/api/jobs/${jobId}`, {
      method: 'DELETE'
    })
  }

  async getCourses() {
    return this.request('/api/courses')
  }

  async createCourse(courseData: any) {
    return this.request('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    })
  }

  async updateCourse(courseId: number, courseData: any) {
    return this.request(`/api/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    })
  }

  async deleteCourse(courseId: number) {
    return this.request(`/api/courses/${courseId}`, {
      method: 'DELETE'
    })
  }

  async getCondos() {
    return this.request('/api/condos')
  }

  async getTravelPosts() {
    return this.request('/api/travel-posts')
  }

  async createTravelPost(travelData: any) {
    return this.request('/api/travel-posts', {
      method: 'POST',
      body: JSON.stringify(travelData)
    })
  }

  async updateTravelPost(travelId: number, travelData: any) {
    return this.request(`/api/travel-posts/${travelId}`, {
      method: 'PUT',
      body: JSON.stringify(travelData)
    })
  }

  async deleteTravelPost(travelId: number) {
    return this.request(`/api/travel-posts/${travelId}`, {
      method: 'DELETE'
    })
  }

  async getGeneralPosts() {
    return this.request('/api/general')
  }

  async createGeneralPost(postData: { text: string; media: string[] }) {
    return this.request('/api/general', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  async updateGeneralPost(postId: number, postData: { text: string; media: string[] }) {
    return this.request(`/api/general/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    })
  }

  async deleteGeneralPost(postId: number) {
    return this.request(`/api/general/${postId}`, {
      method: 'DELETE'
    })
  }

  async getDocs() {
    return this.request('/api/docs')
  }

  async createDoc(docData: { text: string; media: string[] }) {
    return this.request('/api/docs', {
      method: 'POST',
      body: JSON.stringify(docData)
    })
  }

  async deleteDoc(docId: number) {
    return this.request(`/api/docs/${docId}`, {
      method: 'DELETE'
    })
  }

  async getLinks() {
    return this.request('/api/links')
  }

  async createLink(linkData: any) {
    return this.request('/api/links', {
      method: 'POST',
      body: JSON.stringify(linkData)
    })
  }

  async updateLink(linkId: number, linkData: any) {
    return this.request(`/api/links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(linkData)
    })
  }

  async deleteLink(linkId: number) {
    return this.request(`/api/links/${linkId}`, {
      method: 'DELETE'
    })
  }

  async getHighlights() {
    return this.request('/api/highlights')
  }

  async createHighlight(highlightData: { image: string }) {
    return this.request('/api/highlights', {
      method: 'POST',
      body: JSON.stringify(highlightData)
    })
  }

  async updateHighlight(highlightId: number, highlightData: { image: string }) {
    return this.request(`/api/highlights/${highlightId}`, {
      method: 'PUT',
      body: JSON.stringify(highlightData)
    })
  }

  async deleteHighlight(highlightId: number) {
    return this.request(`/api/highlights/${highlightId}`, {
      method: 'DELETE'
    })
  }

  // User endpoints
  async getUserById(userId: string) {
    return this.request(`/api/users/${userId}`)
  }

  async getUsers() {
    return this.request('/api/users')
  }

  // Public endpoint method without authentication
  private async requestPublic(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      throw error
    }
  }

  // Job inquiry
  async submitJobInquiry(jobId: number, inquiryData: any) {
    return this.request('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, ...inquiryData })
    })
  }

  // Analytics endpoints - get real counts from database
  async getAnalyticsData() {
    return this.request('/api/analytics')
  }

  async getRecentActivity() {
    try {
      // Get recent posts from different categories to show real activity
      const [recentJobs, recentHotels, recentRestaurants, recentCourses] = await Promise.all([
        this.getJobs().then(jobs => jobs?.slice(-2) || []).catch(() => []),
        this.getHotels().then(hotels => hotels?.slice(-2) || []).catch(() => []),
        this.getRestaurants().then(restaurants => restaurants?.slice(-2) || []).catch(() => []),
        this.getCourses().then(courses => courses?.slice(-2) || []).catch(() => [])
      ])

      const activities: Array<{
        type: string;
        message: string;
        time: string;
        color: string;
      }> = []

      // Add recent jobs
      recentJobs.forEach((job: any) => {
        activities.push({
          type: 'post',
          message: `New job posted: ${job.title || 'Job Posting'}`,
          time: new Date(job.created_at || Date.now()).toLocaleTimeString(),
          color: 'blue'
        })
      })

      // Add recent hotels
      recentHotels.forEach((hotel: any) => {
        activities.push({
          type: 'update',
          message: `Hotel listing: ${hotel.name || 'Hotel'}`,
          time: new Date(hotel.created_at || Date.now()).toLocaleTimeString(),
          color: 'green'
        })
      })

      // Add recent restaurants
      recentRestaurants.forEach((restaurant: any) => {
        activities.push({
          type: 'review',
          message: `Restaurant added: ${restaurant.name || 'Restaurant'}`,
          time: new Date(restaurant.created_at || Date.now()).toLocaleTimeString(),
          color: 'orange'
        })
      })

      // Add recent courses
      recentCourses.forEach((course: any) => {
        activities.push({
          type: 'enrollment',
          message: `Course published: ${course.title || 'Course'}`,
          time: new Date(course.created_at || Date.now()).toLocaleTimeString(),
          color: 'purple'
        })
      })

      // Sort by creation time and return most recent 5
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  async getAnalyticsStats() {
    try {
      // Use the new backend analytics endpoint for real-time counts
      const response = await this.request('/api/analytics')
      
      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching analytics stats:', error)
      
      // Fallback: Get all data in parallel to calculate real counts if backend analytics fails
      try {
        const [
          restaurants,
          hotels,
          jobs,
          courses,
          condos,
          travel,
          generalPosts,
          docs,
          links,
          highlights,
          users,
          chats
        ] = await Promise.all([
          this.getRestaurants().catch(() => []),
          this.getHotels().catch(() => []),
          this.getJobs().catch(() => []),
          this.getCourses().catch(() => []),
          this.getCondos().catch(() => []),
          this.getTravelPosts().catch(() => []),
          this.getGeneralPosts().catch(() => []),
          this.getDocs().catch(() => []),
          this.getLinks().catch(() => []),
          this.getHighlights().catch(() => []),
          this.getUsers().catch(() => []),
          this.getChats().catch(() => [])
        ])

        // Calculate real counts as fallback
        const stats = {
          totalUsers: users?.length || 0,
          totalPosts: (jobs?.length || 0) + (restaurants?.length || 0) + (hotels?.length || 0) + 
                     (courses?.length || 0) + (condos?.length || 0) + (travel?.length || 0) + 
                     (generalPosts?.length || 0) + (docs?.length || 0) + (links?.length || 0),
          activeChats: chats?.length || 0,
          highlights: highlights?.length || 0,
          categories: {
            jobs: jobs?.length || 0,
            restaurants: restaurants?.length || 0,
            hotels: hotels?.length || 0,
            courses: courses?.length || 0,
            condos: condos?.length || 0,
            travel: travel?.length || 0,
            general: generalPosts?.length || 0,
            docs: docs?.length || 0,
            links: links?.length || 0,
            highlights: highlights?.length || 0
          }
        }

        return stats
      } catch (fallbackError) {
        console.error('Fallback analytics also failed:', fallbackError)
        throw new Error('Unable to fetch analytics data')
      }
    }
  }
}

export const apiService = new ApiService()
