'use client'

import { useState } from 'react'
import { X, Image } from 'lucide-react'
import { Button } from '@/shared/components/Button'

interface BackgroundSettingsProps {
  currentUrl: string
  onClose: () => void
  onSave: (url: string) => void
}

export const BackgroundSettings = ({ currentUrl, onClose, onSave }: BackgroundSettingsProps) => {
  const [url, setUrl] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)

  const extractVideoId = (url: string): boolean => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]
    
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return true
      }
    }
    
    // Check if it's already a video ID
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return true
    }
    
    return false
  }

  const handleSave = () => {
    if (!url.trim()) {
      setError('Vui lòng nhập YouTube URL')
      return
    }

    if (!extractVideoId(url)) {
      setError('URL không hợp lệ. Vui lòng nhập YouTube URL hoặc Video ID')
      return
    }

    setError(null)
    onSave(url)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chọn Background
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nhập YouTube URL hoặc Video ID
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              YouTube URL
            </label>
            <input
              id="youtube-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Ví dụ: https://www.youtube.com/watch?v=zF-__3RANT4
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              className="flex-1"
            >
              Lưu
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

