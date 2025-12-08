'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/Button'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
  disabled?: boolean
}

export function AvatarUpload({
  currentAvatarUrl,
  onUpload,
  onDelete,
  disabled = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update preview when currentAvatarUrl changes
  useEffect(() => {
    setPreview(currentAvatarUrl)
  }, [currentAvatarUrl])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được vượt quá 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    try {
      setUploading(true)
      await onUpload(file)
    } catch (error) {
      // Reset preview on error
      setPreview(currentAvatarUrl)
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa ảnh đại diện?')) return

    try {
      setDeleting(true)
      await onDelete()
      setPreview(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
    }
  }

  const getAvatarUrl = () => {
    if (preview) {
      // If preview is a data URL, return it
      if (preview.startsWith('data:')) {
        return preview
      }
      // If preview is already a full URL, return it
      if (preview.startsWith('http')) {
        return preview
      }
      // Otherwise, construct full URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      return `${apiUrl}${preview.startsWith('/') ? '' : '/'}${preview}`
    }
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()!}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-600">
              {preview ? '?' : '👤'}
            </div>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || deleting}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || deleting}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
        </Button>

        {getAvatarUrl() && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={disabled || uploading || deleting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Xóa
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        JPG, PNG hoặc GIF. Tối đa 5MB
      </p>
    </div>
  )
}

