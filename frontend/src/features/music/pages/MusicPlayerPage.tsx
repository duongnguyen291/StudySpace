'use client'

/**
 * Music Player Page
 * Main page for music player feature
 */
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MusicPlayer } from '../components/MusicPlayer'
import { PlaylistList } from '../components/PlaylistList'
import { YouTubeBackground } from '@/features/pomodoro/components/YouTubeBackground'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'
import { Music, Filter, Timer, Home } from 'lucide-react'
import { musicService } from '../services/musicService'
import type { MusicPlaylist, PlaylistType } from '../types/music.types'

/**
 * Extract YouTube video ID from URL
 */
const extractVideoId = (url: string | null): string | null => {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }
  if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
    return url
  }
  return null
}

export default function MusicPlayerPage() {
  const router = useRouter()
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylist | null>(null)
  const [filterType, setFilterType] = useState<PlaylistType | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const hasAutoSelectedRef = useRef(false)  // ✅ Track if we've auto-selected

  const playlistTypes: (PlaylistType | null)[] = [
    null,
    'lofi',
    'piano',
    'rain',
    'nature',
    'ambient'
  ]

  // Load playlists when filter changes
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await musicService.getPlaylists(filterType || undefined)
        setPlaylists(data)
        
        // ✅ Auto-select first playlist if none selected (only once per filter change)
        if (data.length > 0) {
          // If filter changed, reset selection
          if (filterType !== null) {
            setSelectedPlaylist(data[0])
            hasAutoSelectedRef.current = true
          } 
          // If no playlist selected yet (initial load)
          else if (!selectedPlaylist && !hasAutoSelectedRef.current) {
            setSelectedPlaylist(data[0])
            hasAutoSelectedRef.current = true
          }
          // If selected playlist is not in current filtered list, select first
          else if (selectedPlaylist && !data.find(p => p.id === selectedPlaylist.id)) {
            setSelectedPlaylist(data[0])
          }
        } else {
          // No playlists available
          setSelectedPlaylist(null)
        }
      } catch (error) {
        console.error('Failed to load playlists:', error)
        setSelectedPlaylist(null)
      }
    }
    loadPlaylists()
  }, [filterType])  // ✅ Only depend on filterType

  const handleSelectPlaylist = (playlist: MusicPlaylist) => {
    setSelectedPlaylist(playlist)
    hasAutoSelectedRef.current = true  // ✅ Mark as manually selected
  }

  // Get YouTube video ID for background
  const youtubeVideoId = selectedPlaylist?.audio_url 
    ? extractVideoId(selectedPlaylist.audio_url) || ''
    : ''

  return (
    <div className="relative min-h-screen w-full overflow-hidden md:ml-0">
      {/* YouTube Background - chỉ hiển thị nếu có YouTube URL */}
      {youtubeVideoId && (
        <YouTubeBackground videoId={youtubeVideoId} />
      )}

      {/* Main Content Overlay */}
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Navigation */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Music Player</h1>
                  <p className="text-gray-300">Select a playlist to start playing</p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="border-white/20 text-white hover:bg-white/10 bg-white/10"
                  title="Home"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/pomodoro')}
                  className="border-white/20 text-white hover:bg-white/10 bg-white/10"
                  title="Pomodoro Timer"
                >
                  <Timer className="w-4 h-4 mr-2" />
                  Timer
                </Button>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-white/20 text-white hover:bg-white/10 bg-white/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {playlistTypes.map((type) => (
                  <button
                    key={type || 'all'}
                    onClick={() => {
                      setFilterType(type)
                      hasAutoSelectedRef.current = false  // ✅ Reset when filter changes
                    }}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm transition-colors',
                      filterType === type
                        ? 'bg-white text-gray-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                  >
                    {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'}
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Playlist List */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Playlists</h2>
                <PlaylistList
                  onSelectPlaylist={handleSelectPlaylist}
                  selectedPlaylistId={selectedPlaylist?.id}
                  filterType={filterType}
                />
              </div>
            </div>

            {/* Music Player */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Now Playing</h2>
                <MusicPlayer 
                  playlist={selectedPlaylist}
                  playlists={playlists}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}