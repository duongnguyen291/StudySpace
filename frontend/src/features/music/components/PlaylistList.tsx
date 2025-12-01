'use client'

/**
 * Playlist List Component
 * Displays list of available playlists
 */
import { useState, useEffect, useCallback } from 'react'
import { musicService } from '../services/musicService'
import { cn } from '@/shared/utils/cn'
import { Music, Loader2 } from 'lucide-react'
import type { MusicPlaylist, PlaylistType } from '../types/music.types'

interface PlaylistListProps {
  onSelectPlaylist: (playlist: MusicPlaylist) => void
  selectedPlaylistId?: string | null
  filterType?: PlaylistType | null
  className?: string
}

export const PlaylistList = ({
  onSelectPlaylist,
  selectedPlaylistId,
  filterType = null,
  className
}: PlaylistListProps) => {
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPlaylists = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await musicService.getPlaylists(filterType || undefined)
      setPlaylists(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load playlists')
    } finally {
      setIsLoading(false)
    }
  }, [filterType])

  useEffect(() => {
    loadPlaylists()
  }, [loadPlaylists])

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-white/70" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('p-4 bg-red-500/20 border border-red-500/50 rounded-lg', className)}>
        <p className="text-sm text-red-200">{error}</p>
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <p className="text-white/70 text-sm">No playlists available</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {playlists.map((playlist) => (
        <button
          key={playlist.id}
          onClick={() => onSelectPlaylist(playlist)}
          className={cn(
            'w-full p-4 rounded-lg transition-all text-left',
            'bg-white/10 backdrop-blur-sm border border-white/20',
            'hover:bg-white/20 hover:border-white/30',
            selectedPlaylistId === playlist.id &&
              'bg-white/20 border-white/40 ring-2 ring-white/30'
          )}
        >
          <div className="flex items-center gap-4">
            {/* Thumbnail or Icon */}
            {playlist.thumbnail_url ? (
              <img
                src={playlist.thumbnail_url}
                alt={playlist.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                <Music className="w-8 h-8 text-white/70" />
              </div>
            )}

            {/* Playlist Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white mb-1 truncate">{playlist.name}</h4>
              {playlist.description && (
                <p className="text-sm text-white/70 line-clamp-2">{playlist.description}</p>
              )}
              {playlist.playlist_type && (
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-white/10 rounded text-white/80">
                    {playlist.playlist_type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}