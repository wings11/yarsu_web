import { supabase } from './supabase'
import { apiService } from './api'
import type { User } from './supabase'

export class AuthService {
  static async signUp(email: string, password: string) {
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase.auth.getUser()
      if (existingUser?.user?.email === email) {
        throw new Error('User already signed in with this email')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email verification redirect since it's disabled
        }
      })

      if (error) {
        throw error
      }

      if (data.user && data.user.email_confirmed_at) {
        // User is immediately confirmed (email verification disabled)
        await this.setupUserProfileAndChat(data.user.id, data.user.email!)
      }

      return data
    } catch (error) {
      throw error
    }
  }

  static async setupUserProfileAndChat(userId: string, email: string) {
    try {
      // Wait a bit for any database triggers to complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check if user profile already exists (created by trigger)
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        // Log error but don't throw
      }

      if (!existingProfile) {
        // Create user profile only if it doesn't exist
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: email,
              role: 'user'
            }
          ])

        if (profileError) {
          if (profileError.code === '23505') {
            // User profile already exists (race condition)
          } else {
            // Profile creation error but don't throw
          }
        }
      }

      // Check if chat already exists
      const { data: existingChat, error: chatCheckError } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (chatCheckError && chatCheckError.code !== 'PGRST116') {
        // Log error but don't throw
      }

      if (!existingChat) {
        // Create chat if it doesn't exist
        const { error: chatError } = await supabase
          .from('chats')
          .insert([{ user_id: userId }])
        
        if (chatError) {
          if (chatError.code === '23505') {
            // Chat already exists (race condition)
          } else {
            // Failed to create chat but don't throw
          }
        }
      }
    } catch (error) {
      // Don't throw here as the main signup was successful
    }
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // For existing users, ensure they have a chat
    if (data.user) {
      console.log('User signed in, checking if chat exists for existing user...')
      await this.ensureChatExists(data.user.id)
    }

    return data
  }

  static async ensureChatExists(userId: string) {
    try {
      // Check if chat already exists
      const { data: existingChat, error: chatCheckError } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (chatCheckError && chatCheckError.code !== 'PGRST116') {
        console.error('Error checking existing chat:', chatCheckError)
        return
      }

      if (!existingChat) {
        console.log('No chat found for existing user, creating one...')
        // Create chat if it doesn't exist
        const { error: chatError } = await supabase
          .from('chats')
          .insert([{ user_id: userId }])
        
        if (chatError) {
          if (chatError.code === '23505') {
            console.log('Chat already exists (race condition)')
          } else {
            console.error('Failed to create chat for existing user:', chatError)
          }
        } else {
          console.log('Chat created successfully for existing user')
        }
      } else {
        console.log('Chat already exists for user')
      }
    } catch (error) {
      console.error('Error in ensureChatExists:', error)
      // Don't throw here as the sign in was successful
    }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return profile
  }

  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event: any, session: any) => {
      callback(session?.user ?? null)
    })
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  static async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }
}
