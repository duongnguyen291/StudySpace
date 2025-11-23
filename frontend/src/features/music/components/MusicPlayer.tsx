'use client'

/**
 * Music Player Component
 * Main music player UI with controls
 * Supports both regular audio files and YouTube videos
 */
import { useMusicPlayer } from '../hooks/useMusicPlayer'
import { Button } from '@/shared/components/Button'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Loader2
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { MusicPlaylist } from '../types/music.types'

interface MusicPlayerProps {
  playlist: MusicPlaylist | null
  playlists?: MusicPlaylist[]  // ✅ Thêm playlists prop
  onPlaylistChange?: (playlist: MusicPlaylist | null) => void
  className?: string
}

/**
 * Check if URL is YouTube
 */
const isYouTubeUrl = (url: string | null): boolean => {
  if (!url) return false
  return url.includes('youtube.com') || url.includes('youtu.be')
}

export const MusicPlayer = ({
  playlist,
  playlists = [],  // ✅ Default empty array
  onPlaylistChange,
  className
}: MusicPlayerProps) => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoop,
    isMuted,
    isLoading,
    error,
    togglePlayPause,
    stop,
    seek,
    next,  // ✅ Thêm next
    previous,  // ✅ Thêm previous
    setVolume,
    toggleLoop,
    toggleMute,
    formatTime,
    youtubeIframeRef,  // ✅ Thêm YouTube iframe ref
  } = useMusicPlayer({
    initialPlaylist: playlist,
    playlists,  // ✅ Truyền playlists vào hook
    autoPlay: false
  })

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    seek(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  const isYouTube = playlist ? isYouTubeUrl(playlist.audio_url) : false
  const canNavigate = playlists.length > 1  // ✅ Check if can navigate

  if (!playlist) {
    return (
      <div
        className={cn(
          'flex items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20',
          className
        )}
      >
        <p className="text-white/70 text-sm">No playlist selected</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6',
        className
      )}
    >
      {/* YouTube iframe - hiển thị video */}
      {isYouTube && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <div 
            ref={youtubeIframeRef}
            className="w-full aspect-video"  
          />
        </div>
      )}

      {/* Playlist Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{playlist.name}</h3>
        {playlist.description && (
          <p className="text-sm text-white/70">{playlist.description}</p>
        )}
        {canNavigate && (
          <p className="text-xs text-white/50 mt-1">
            {playlists.findIndex(p => p.id === playlist.id) + 1} of {playlists.length}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          style={{
            background: `linear-gradient(to right, white 0%, white ${progressPercentage}%, rgba(255,255,255,0.2) ${progressPercentage}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        <div className="flex justify-between mt-1 text-xs text-white/70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Left: Loop Button */}
        <button
          onClick={toggleLoop}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isLoop
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          )}
          title={isLoop ? 'Loop enabled' : 'Loop disabled'}
        >
          {isLoop ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
        </button>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={previous}  // ✅ Thay đổi từ stop sang previous
            disabled={!canNavigate}  // ✅ Disable nếu không có nhiều playlists
            className={cn(
              'p-2 rounded-lg transition-colors',
              canNavigate
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-white/30 cursor-not-allowed'
            )}
            title="Previous"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <Button
            onClick={togglePlayPause}
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="px-6 py-3 rounded-full"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>

          <button
            onClick={next}  // ✅ Thay đổi từ stop sang next
            disabled={!canNavigate}  // ✅ Disable nếu không có nhiều playlists
            className={cn(
              'p-2 rounded-lg transition-colors',
              canNavigate
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-white/30 cursor-not-allowed'
            )}
            title="Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-xs text-white/70 w-8">{volume}%</span>
        </div>
      </div>
    </div>
  )
}