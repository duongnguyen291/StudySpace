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
  Loader2,
  ExternalLink
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

/**
 * Extract YouTube video ID from URL
 */
const extractVideoId = (url: string): string | null => {
  if (!url) return null
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) {
      return match[1]
    }
  }
  
  // If no pattern matches, assume it's already a video ID
  if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
    return url
  }
  
  return null
}

/**
 * Extract Spotify embed URL from open.spotify.com URL
 * Supports: playlist, track, album, artist, episode, show
 * Input: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 * Output: https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M
 */
const getSpotifyEmbedUrl = (url: string): string | null => {
  if (!url) return null
  
  // Match patterns like /playlist/, /track/, /album/, /artist/, /episode/, /show/
  const match = url.match(/open\.spotify\.com\/(playlist|track|album|artist|episode|show)\/([a-zA-Z0-9]+)/)
  if (match) {
    const type = match[1]
    const id = match[2]
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  }
  
  return null
}

/**
 * Check if URL is Spotify
 */
const isSpotifyUrl = (url: string | null): boolean => {
  if (!url) return false
  return url.includes('open.spotify.com')
}

/**
 * Xác định playlist thuộc dịch vụ streaming ngoài không thể embed
 * (Apple Music / YouTube Music) - chỉ có thể mở external link
 */
const getExternalStreamingService = (
  url: string | null
): 'apple_music' | 'youtube_music' | null => {
  if (!url) return null
  const lower = url.toLowerCase()
  // Spotify giờ có thể embed được nên không cần external link
  if (lower.includes('music.apple.com')) return 'apple_music'
  if (lower.includes('music.youtube.com')) return 'youtube_music'
  return null
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
    setVolume,
    toggleLoop,
    toggleMute,
    formatTime,
  } = useMusicPlayer({
    initialPlaylist: playlist,
    playlists,
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

  // Tìm index của playlist hiện tại trong danh sách
  const currentIndex = playlist ? playlists.findIndex(p => p.id === playlist.id) : -1
  
  // Handler cho nút Next - chuyển sang playlist tiếp theo
  const handleNext = () => {
    if (playlists.length === 0) return
    const nextIndex = currentIndex < playlists.length - 1 ? currentIndex + 1 : 0
    const nextPlaylist = playlists[nextIndex]
    if (nextPlaylist && onPlaylistChange) {
      onPlaylistChange(nextPlaylist)
    }
  }
  
  // Handler cho nút Previous - quay lại playlist trước
  const handlePrevious = () => {
    if (playlists.length === 0) return
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlists.length - 1
    const prevPlaylist = playlists[prevIndex]
    if (prevPlaylist && onPlaylistChange) {
      onPlaylistChange(prevPlaylist)
    }
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  const isYouTube = playlist ? isYouTubeUrl(playlist.audio_url) : false
  const isSpotify = playlist ? isSpotifyUrl(playlist.audio_url) : false
  const externalService = playlist ? getExternalStreamingService(playlist.audio_url) : null
  const canNavigate = playlists.length > 1
  
  // Lấy YouTube video ID để embed trực tiếp
  const youtubeVideoId = playlist?.audio_url ? extractVideoId(playlist.audio_url) : null
  
  // Lấy Spotify embed URL
  const spotifyEmbedUrl = playlist?.audio_url ? getSpotifyEmbedUrl(playlist.audio_url) : null

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
        'bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4',
        className
      )}
    >
      {/* YouTube iframe - embed trực tiếp với controls */}
      {isYouTube && youtubeVideoId && (
        <div className="mb-4 rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&playsinline=1`}
            title={playlist.name}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      
      {/* Spotify iframe - embed playlist/track/album */}
      {isSpotify && spotifyEmbedUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <iframe
            src={spotifyEmbedUrl}
            title={playlist.name}
            className="w-full rounded-xl"
            style={{ minHeight: '352px' }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}

      {/* Playlist Info */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white mb-1 truncate">{playlist.name}</h3>
        {playlist.description && (
          <p className="text-xs text-white/70 line-clamp-2">{playlist.description}</p>
        )}
        {canNavigate && (
          <p className="text-xs text-white/50 mt-1">
            {playlists.findIndex(p => p.id === playlist.id) + 1} of {playlists.length}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      {/* Nếu là dịch vụ streaming không embed được (Apple Music / YouTube Music),
          chỉ hiển thị CTA mở external link */}
      {externalService ? (
        <div className="space-y-3">
          <div className="p-3 bg-black/30 rounded-lg border border-white/20">
            <p className="text-sm text-white/80">
              Playlist này phát qua dịch vụ ngoài.
            </p>
          </div>
          <a
            href={playlist.audio_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {externalService === 'apple_music' && 'Mở trong Apple Music'}
            {externalService === 'youtube_music' && 'Mở trong YouTube Music'}
          </a>
        </div>
      ) : isSpotify ? (
        // Spotify đã được embed ở trên, chỉ hiển thị nút chuyển playlist
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePrevious}
            disabled={!canNavigate}
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
          
          <a
            href={playlist.audio_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#1DB954] text-white rounded-full text-sm font-medium hover:bg-[#1ed760] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Mở trong Spotify
          </a>
          
          <button
            onClick={handleNext}
            disabled={!canNavigate}
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
      ) : isYouTube ? (
        // YouTube được embed trực tiếp với controls, chỉ hiển thị nút chuyển playlist
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePrevious}
            disabled={!canNavigate}
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
          
          <a
            href={playlist.audio_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Mở trên YouTube
          </a>
          
          <button
            onClick={handleNext}
            disabled={!canNavigate}
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
      ) : (
        // Audio files - full controls
        <>
          {/* Progress Bar */}
          <div className="mb-3">
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
          <div className="flex flex-wrap items-center justify-center gap-3">
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
                onClick={handlePrevious}
                disabled={!canNavigate}
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
                onClick={handleNext}
                disabled={!canNavigate}
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
            <div className="flex items-center gap-2 min-w-[140px]">
              <button
                onClick={toggleMute}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
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
        </>
      )}
    </div>
  )
}