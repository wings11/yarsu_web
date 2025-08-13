'use client'

import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StorageService } from '@/lib/storage'
import { 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Upload,
  Loader2
} from 'lucide-react'

interface FileAttachmentProps {
  onFileSelect: (fileUrl: string, fileName: string, fileType: string, file?: File) => void
  onClearFile?: () => void
  disabled?: boolean
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  shouldClear?: boolean // Add this to trigger clearing from parent
}

interface AttachedFile {
  file: File
  url: string
  name: string
  type: string
  size: number
  uploading: boolean
  error?: string
}

export default function FileAttachment({ 
  onFileSelect, 
  onClearFile,
  disabled = false,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx', '.txt', '.zip'],
  shouldClear = false
}: FileAttachmentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null)
  
  // Clear file when shouldClear prop changes
  React.useEffect(() => {
    if (shouldClear && attachedFile) {
      if (attachedFile?.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachedFile.url)
      }
      setAttachedFile(null)
      if (onClearFile) {
        onClearFile()
      }
    }
  }, [shouldClear, attachedFile, onClearFile])
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size based on file type
    let maxSizeForFile = maxFileSize
    if (file.type.startsWith('video/')) {
      maxSizeForFile = 50 // 50MB for videos
    } else if (file.type.startsWith('image/')) {
      maxSizeForFile = 5 // 5MB for images
    }
    
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeForFile) {
      alert(`File size must be less than ${maxSizeForFile}MB`)
      return
    }

    // Create preview URL for immediate display
    const previewUrl = URL.createObjectURL(file)
    
    const fileAttachment: AttachedFile = {
      file,
      url: previewUrl,
      name: file.name,
      type: file.type,
      size: file.size,
      uploading: false // Not uploading yet, will upload when message is sent
    }

    setAttachedFile(fileAttachment)

    // Create a blob URL for preview but don't upload yet
    // The upload will be handled by the ChatInterface when sending the message
    onFileSelect(previewUrl, file.name, file.type, file)

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = () => {
    if (attachedFile?.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachedFile.url)
    }
    setAttachedFile(null)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    if (fileType.startsWith('video/')) {
      return <Upload className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getFileCategory = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (StorageService.isDocumentType(fileType)) return 'document'
    return 'file'
  }

  return (
    <div className="flex flex-col space-y-2">
      {/* File Input Button */}
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || attachedFile?.uploading}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || attachedFile?.uploading}
          className="flex items-center space-x-1"
        >
          <Paperclip className="h-4 w-4" />
          <span className="hidden sm:inline">Attach</span>
        </Button>
      </div>

      {/* File Preview */}
      {attachedFile && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileCategory(attachedFile.type) === 'image' ? (
                <div className="relative">
                  <img 
                    src={attachedFile.url} 
                    alt={attachedFile.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  {attachedFile.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : getFileCategory(attachedFile.type) === 'video' ? (
                <div className="relative">
                  <video 
                    src={attachedFile.url} 
                    className="w-12 h-12 object-cover rounded"
                    muted
                  />
                  {attachedFile.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                  {attachedFile.uploading ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : (
                    getFileIcon(attachedFile.type)
                  )}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {StorageService.formatFileSize(attachedFile.size)}
              </p>
              {attachedFile.uploading && (
                <p className="text-xs text-blue-600">Uploading...</p>
              )}
              {attachedFile.error && (
                <p className="text-xs text-red-600">{attachedFile.error}</p>
              )}
            </div>

            {/* Remove Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={attachedFile.uploading}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
