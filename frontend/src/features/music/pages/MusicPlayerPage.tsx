'use client'

/**
 * Music Player Page
 * Main page for music player feature
 */
import { useState } from 'react'
import { MusicPlayer } from '../components/MusicPlayer'
import { PlaylistList } from '../components/PlaylistList'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'
import { Music, Filter } from 'lucide-react'
import type { MusicPlaylist, PlaylistType } from '../types/music.types'

export default function MusicPlayerPage() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylist | null>(null)
  const [filterType, setFilterType] = useState<PlaylistType | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const playlistTypes: (PlaylistType | null)[] = [
    null,
    'lofi',
    'piano',
    'rain',
    'nature',
    'ambient'
  ]

  const handleSelectPlaylist = (playlist: MusicPlaylist) => {
    setSelectedPlaylist(playlist)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Music Player</h1>
              <p className="text-gray-400">Select a playlist to start playing</p>
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-white/20 text-white hover:bg-white/10"
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
                  onClick={() => setFilterType(type)}
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
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Playlist List */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Playlists</h2>
              <PlaylistList
                onSelectPlaylist={handleSelectPlaylist}
                selectedPlaylistId={selectedPlaylist?.id}
                filterType={filterType}
              />
            </div>
          </div>

          {/* Music Player */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
              <MusicPlayer playlist={selectedPlaylist} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}