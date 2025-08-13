import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database
export interface User {
  id: string
  email: string
  role: 'member' | 'admin' | 'superadmin'
}

export interface Chat {
  id: number
  user_id: string
  created_at: string
  last_message_at?: string
  unread_count?: number
  user?: {
    id: string
    email: string
    // display_name?: string
    role?: string
  }
}

export interface Message {
  id: number
  chat_id: number
  sender_id: string
  message: string
  type: 'text' | 'image' | 'file' | 'video'
  file_url?: string
  file_name?: string
  file_type?: string
  created_at: string
  read_at?: string
}

export interface Restaurant {
  id: number
  name: string
  location: string
  images: string[]
  popular_picks: string[]
  admin_rating: number
  notes?: string
  created_at: string
}

export interface Hotel {
  id: number
  name: string
  address: string
  price: number
  nearby_famous_places: string[]
  breakfast: boolean
  free_wifi: boolean
  swimming_pool: boolean
  images: string[]
  notes?: string
  admin_rating: number
  created_at: string
}

export interface Job {
  id: number
  title: string
  pinkcard: boolean
  thai: boolean
  payment_type: boolean
  stay: boolean
  location?: string
  job_location: string
  notes?: string
  created_at: string
}

export interface Course {
  id: number
  name: string
  duration: string
  price: number
  centre_name: string
  location: string
  notes?: string
  created_at: string
}

export interface Condo {
  id: number
  name: string
  address: string
  rent_fee: number
  images: string[]
  swimming_pool: boolean
  free_wifi: boolean
  gym: boolean
  garden: boolean
  co_working_space: boolean
  notes?: string
  created_at: string
}

export interface TravelPost {
  id: number
  name: string
  place: string
  highlights: string[]
  images: string[]
  admin_rating: number
  notes?: string
  created_at: string
}

export interface GeneralPost {
  id: number
  text: string
  media: string[]
  created_at: string
}

export interface Doc {
  id: number
  text: string
  media: string[]
  created_at: string
}

export interface Link {
  id: number
  platform: string
  url: string
  created_at: string
}

export interface Highlight {
  id: number
  image: string
  created_at: string
}
