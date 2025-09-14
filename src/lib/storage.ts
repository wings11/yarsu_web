import { supabase } from './supabase'

export class StorageService {
  /**
   * Upload an image file to Supabase storage and return the public URL
   * @param file - The image file to upload
   * @param bucket - The storage bucket name (default: 'images')
   * @param folder - Optional folder path within the bucket
   * @param onProgress - Optional callback for upload progress (percentage: number) => void
   * @returns Promise<string> - The public URL of the uploaded image
   */
  static async uploadImage(
    file: File, 
    bucket: string = 'images',
    folder?: string,
    onProgress?: (percentage: number) => void
  ): Promise<string> {
    return this.uploadFile(file, bucket, folder, 'image', onProgress)
  }

  /**
   * Upload any file to Supabase storage and return the public URL
   * @param file - The file to upload
   * @param bucket - The storage bucket name (default: 'images')
   * @param folder - Optional folder path within the bucket
   * @param fileType - Expected file type ('image', 'video', 'document', 'any')
   * @param onProgress - Optional callback for upload progress (percentage: number) => void
   * @returns Promise<string> - The public URL of the uploaded file
   */
  static async uploadFile(
    file: File, 
    bucket: string = 'images',
    folder?: string,
    fileType: 'image' | 'video' | 'document' | 'any' = 'any',
    onProgress?: (percentage: number) => void
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

      // No file size limits - using Supabase Pro with ample storage
      // Note: Large files may take longer to upload and download
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `${timestamp}-${randomString}.${fileExt}`
      
      // Create full path
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // For large files, use XMLHttpRequest with progress tracking
      if (onProgress && file.size > 10 * 1024 * 1024) { // 10MB+
        return this.uploadFileWithProgress(file, bucket, filePath, onProgress)
      }

      // For smaller files, use standard Supabase upload
      onProgress?.(0) // Start progress
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      onProgress?.(100) // Complete progress

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
   * Upload file with progress tracking using XMLHttpRequest
   * @param file - The file to upload
   * @param bucket - The storage bucket name
   * @param filePath - The file path in storage
   * @param onProgress - Progress callback function
   * @returns Promise<string> - The public URL of the uploaded file
   */
  static async uploadFileWithProgress(
    file: File,
    bucket: string,
    filePath: string,
    onProgress: (percentage: number) => void
  ): Promise<string> {
    try {
      // Try to use signed upload URL first
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .createSignedUploadUrl(filePath)

        if (!uploadError && uploadData) {
          // Use XMLHttpRequest with progress tracking
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const percentage = Math.round((event.loaded / event.total) * 100)
                onProgress(percentage)
              }
            })

            xhr.addEventListener('load', async () => {
              if (xhr.status === 200) {
                try {
                  const { data: publicUrlData } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(filePath)

                  if (!publicUrlData.publicUrl) {
                    throw new Error('Failed to get public URL')
                  }

                  resolve(publicUrlData.publicUrl)
                } catch (error) {
                  reject(error)
                }
              } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`))
              }
            })

            xhr.addEventListener('error', () => {
              reject(new Error('Upload failed'))
            })

            xhr.addEventListener('abort', () => {
              reject(new Error('Upload aborted'))
            })

            xhr.open('PUT', uploadData.signedUrl)
            xhr.setRequestHeader('Content-Type', file.type)
            xhr.send(file)
          })
        }
      } catch (signedUrlError) {
        console.log('Signed URL not available, using standard upload with simulated progress')
      }

      // Fallback: Use standard upload with simulated progress
      return new Promise(async (resolve, reject) => {
        try {
          // Simulate progress for user feedback
          const progressInterval = setInterval(() => {
            // Simulate progress based on file size (rough estimation)
            const progress = Math.min(90, Math.random() * 80 + 10)
            onProgress(Math.round(progress))
          }, 100)

          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          clearInterval(progressInterval)
          onProgress(100)

          if (error) {
            throw error
          }

          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

          if (!publicUrlData.publicUrl) {
            throw new Error('Failed to get public URL')
          }

          resolve(publicUrlData.publicUrl)
        } catch (error) {
          reject(error)
        }
      })

    } catch (error) {
      console.error('Error uploading file with progress:', error)
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
