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
    return this.uploadFile(file, bucket, folder, 'image')
  }

  /**
   * Upload any file to Supabase storage and return the public URL
   * @param file - The file to upload
   * @param bucket - The storage bucket name (default: 'images')
   * @param folder - Optional folder path within the bucket
   * @param fileType - Expected file type ('image', 'video', 'document', 'any')
   * @returns Promise<string> - The public URL of the uploaded file
   */
  static async uploadFile(
    file: File, 
    bucket: string = 'images',
    folder?: string,
    fileType: 'image' | 'video' | 'document' | 'any' = 'any'
  ): Promise<string> {
    try {
      // Validate file type
      if (fileType === 'image' && !file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }
      
      if (fileType === 'video' && !file.type.startsWith('video/')) {
        throw new Error('File must be a video')
      }
      
      if (fileType === 'document' && !this.isDocumentType(file.type)) {
        throw new Error('File must be a document (PDF, DOC, DOCX, TXT, etc.)')
      }

      // Validate file size (max 50MB for videos, 10MB for documents, 5MB for images)
      let maxSize = 5 * 1024 * 1024 // Default 5MB for images
      if (fileType === 'video' || file.type.startsWith('video/')) {
        maxSize = 50 * 1024 * 1024 // 50MB for videos
      } else if (fileType === 'document' || this.isDocumentType(file.type)) {
        maxSize = 10 * 1024 * 1024 // 10MB for documents
      }
      
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024)
        throw new Error(`File size must be less than ${maxSizeMB}MB`)
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
      console.error('Error uploading file:', error)
      throw error
    }
  }

  /**
   * Check if file type is a document
   * @param mimeType - The MIME type to check
   * @returns boolean
   */
  static isDocumentType(mimeType: string): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed'
    ]
    return documentTypes.includes(mimeType)
  }

  /**
   * Get file type category from MIME type
   * @param mimeType - The MIME type
   * @returns string - 'image', 'video', 'document', or 'other'
   */
  static getFileCategory(mimeType: string): 'image' | 'video' | 'document' | 'other' {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (this.isDocumentType(mimeType)) return 'document'
    return 'other'
  }

  /**
   * Format file size to human readable string
   * @param bytes - File size in bytes
   * @returns string - Formatted file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
