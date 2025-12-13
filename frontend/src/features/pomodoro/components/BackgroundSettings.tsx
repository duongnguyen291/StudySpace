// Popup để nhập URL YouTube hoặc Video ID và lưu lại làm background video cho trang StudySpace của bạn.

'use client'

import { useState } from 'react'
import { X, Image, Youtube, Play } from 'lucide-react'
import { Button } from '@/shared/components/Button'

interface BackgroundSettingsProps {
  currentUrl: string
  onClose: () => void
  onSave: (url: string) => void
}

interface PresetBackground {
  id: string
  title: string
  videoId: string
  thumbnail: string
  category: string
}

// Danh sách background có sẵn
const PRESET_BACKGROUNDS: PresetBackground[] = [
  {
    id: '1',
    title: 'Meow Meow',
    videoId: '9kzE8isXlQY',
    thumbnail: 'https://img.youtube.com/vi/9kzE8isXlQY/maxresdefault.jpg',
    category: 'Animals'
  },
  {
    id: '2',
    title: 'Fire',
    videoId: 'CHFif_y2TyM',
    thumbnail: 'https://img.youtube.com/vi/CHFif_y2TyM/maxresdefault.jpg',
    category: 'Cozy'
  },
  {
    id: '3',
    title: 'Warm House',
    videoId: '3FofzaB5NPQ',
    thumbnail: 'https://img.youtube.com/vi/3FofzaB5NPQ/maxresdefault.jpg',
    category: 'Cozy'
  },
  {
    id: '4',
    title: 'Relax Fire',
    videoId: '7-TaFkR6zzs',
    thumbnail: 'https://img.youtube.com/vi/7-TaFkR6zzs/maxresdefault.jpg',
    category: 'Cozy'
  },
  {
    id: '5',
    title: 'Warm Winter',
    videoId: 'F_ipuCFnnzY',
    thumbnail: 'https://img.youtube.com/vi/F_ipuCFnnzY/maxresdefault.jpg',
    category: 'Nature'
  },
  {
    id: '6',
    title: 'Cat',
    videoId: 'GrG2-oX5z24',
    thumbnail: 'https://img.youtube.com/vi/GrG2-oX5z24/maxresdefault.jpg',
    category: 'Animals'
  },
]

export const BackgroundSettings = ({ currentUrl, onClose, onSave }: BackgroundSettingsProps) => {
  const [url, setUrl] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets')
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)

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

  const extractVideoIdFromUrl = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    // Check if it's already a video ID
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url
    }
    
    return null
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

  const handleSelectPreset = (preset: PresetBackground) => {
    setUrl(preset.videoId)
    setPreviewVideoId(preset.videoId)
  }

  const handleSavePreset = () => {
    if (previewVideoId) {
      onSave(previewVideoId)
      onClose()
    }
  }

  const currentVideoId = extractVideoIdFromUrl(currentUrl) || currentUrl

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
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
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'presets'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Background có sẵn
            </div>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'custom'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              Nhập link YouTube
            </div>
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'presets' ? (
            <>
              {/* Preset Backgrounds Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                {PRESET_BACKGROUNDS.map((preset) => {
                  const isSelected = extractVideoIdFromUrl(currentUrl) === preset.videoId || currentUrl === preset.videoId
                  const isPreviewing = previewVideoId === preset.videoId
                  
                  return (
                    <div
                      key={preset.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/50'
                          : isPreviewing
                          ? 'border-blue-400 ring-2 ring-blue-400/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                      onClick={() => handleSelectPreset(preset)}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={preset.thumbnail}
                          alt={preset.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback nếu thumbnail không load được
                            e.currentTarget.src = `https://img.youtube.com/vi/${preset.videoId}/hqdefault.jpg`
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Đang dùng
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-900">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {preset.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {preset.category}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Preview Section */}
              {previewVideoId && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Preview
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=0&mute=1&controls=1&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Xem trước Background"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSavePreset}
                  className="flex-1"
                  disabled={!previewVideoId}
                >
                  Áp dụng background này
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
            </>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  YouTube URL hoặc Video ID
                </label>
                <input
                  id="youtube-url"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setError(null)
                  }}
                  placeholder="https://www.youtube.com/watch?v=... hoặc Video ID"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ví dụ: https://www.youtube.com/watch?v=zF-__3RANT4 hoặc zF-__3RANT4
                </p>
              </div>

              {/* Preview for custom URL */}
              {url && extractVideoId(url) && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Preview
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${extractVideoIdFromUrl(url) || url}?autoplay=0&mute=1&controls=1&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Xem trước Background"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

