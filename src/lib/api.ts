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

  async sendMessage(message: string, chatId?: number, type: string = 'text') {
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

  async replyMessage(message: string, chatId: number, type: string = 'text') {
    return this.request('/api/reply', {
      method: 'POST',
      body: JSON.stringify({ 
        message, 
        type,
        chat_id: chatId 
      })
    })
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
}

export const apiService = new ApiService()
