import { supabase } from './supabase'

export class StorageService {
  /**
   * Upload an image file to Supabase storage and return the public URL
   * @param file - The image file to upload
   * @param bucket - The storage bucket name (default: 'images')
   * @param folder - Optional folder path within the bucket
   * @returns Promise<string> - The public URL of the uploaded image
   */
  static async uploadImage(
    file: File, 
    bucket: string = 'images',
    folder?: string
  ): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `${timestamp}-${randomString}.${fileExt}`
      
      // Create full path
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  /**
   * Delete an image from Supabase storage
   * @param url - The public URL of the image to delete
   * @param bucket - The storage bucket name (default: 'images')
   */
  static async deleteImage(url: string, bucket: string = 'images'): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = url.split('/')
      const bucketIndex = urlParts.findIndex(part => part === bucket)
      
      if (bucketIndex === -1) {
        throw new Error('Invalid image URL')
      }

      const filePath = urlParts.slice(bucketIndex + 1).join('/')

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  /**
   * Upload multiple images and return their public URLs
   * @param files - Array of image files to upload
   * @param bucket - The storage bucket name (default: 'images')
   * @param folder - Optional folder path within the bucket
   * @returns Promise<string[]> - Array of public URLs
   */
  static async uploadMultipleImages(
    files: File[],
    bucket: string = 'images',
    folder?: string
  ): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, bucket, folder))
    return Promise.all(uploadPromises)
  }

  /**
   * Check if a URL is a blob URL (temporary)
   * @param url - The URL to check
   * @returns boolean - True if it's a blob URL
   */
  static isBlobUrl(url: string): boolean {
    return url.startsWith('blob:')
  }

  /**
   * Check if a URL is a Supabase storage URL (permanent)
   * @param url - The URL to check
   * @returns boolean - True if it's a Supabase storage URL
   */
  static isSupabaseStorageUrl(url: string): boolean {
    return url.includes('supabase.co/storage/v1/object/public/')
  }
}
