/**
 * Music Player Hook
 * Manages music player state and playback logic
 * Supports regular audio files only (YouTube is now embedded via iframe)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import type { MusicPlaylist } from '../types/music.types'

interface UseMusicPlayerProps {
  initialPlaylist?: MusicPlaylist | null
  playlists?: MusicPlaylist[]
  autoPlay?: boolean
}

/**
 * Check if URL is YouTube
 */
const isYouTubeUrl = (url: string | null): boolean => {
  if (!url) return false
  return url.includes('youtube.com') || url.includes('youtu.be')
}

/**
 * Check if URL is Spotify
 */
const isSpotifyUrl = (url: string | null): boolean => {
  if (!url) return false
  return url.includes('open.spotify.com')
}

/**
 * Check if URL is an embeddable service (YouTube or Spotify)
 * These don't need audio element - they use iframe embed
 */
const isEmbeddableUrl = (url: string | null): boolean => {
  return isYouTubeUrl(url) || isSpotifyUrl(url)
}

export const useMusicPlayer = ({
  initialPlaylist = null,
  playlists = [],
  autoPlay = false
}: UseMusicPlayerProps = {}) => {
  const [currentPlaylist, setCurrentPlaylist] = useState<MusicPlaylist | null>(initialPlaylist)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50) // 0-100
  const [isLoop, setIsLoop] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sync currentPlaylist với initialPlaylist khi prop thay đổi
  useEffect(() => {
    if (initialPlaylist?.id !== currentPlaylist?.id) {
      setCurrentPlaylist(initialPlaylist)
      setCurrentTime(0)
      setIsPlaying(false)
      setError(null)
    }
  }, [initialPlaylist?.id])

  // Find current playlist index
  useEffect(() => {
    if (currentPlaylist && playlists.length > 0) {
      const index = playlists.findIndex(p => p.id === currentPlaylist.id)
      setCurrentIndex(index)
    }
  }, [currentPlaylist, playlists])

  // Initialize audio element for regular audio files only (not YouTube/Spotify embeds)
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Skip if URL is embeddable (YouTube/Spotify) - they use iframe, not audio element
    if (isEmbeddableUrl(currentPlaylist?.audio_url || null)) return

    audioRef.current = new Audio()
    
    const handleLoadedMetadata = () => {
      setDuration(audioRef.current?.duration || 0)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current?.currentTime || 0)
    }

    const handleEnded = () => {
      if (isLoop) {
        audioRef.current?.play()
      } else {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    }

    const handleError = () => {
      setError('Failed to load audio')
      setIsLoading(false)
      setIsPlaying(false)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }

    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
    audioRef.current.addEventListener('ended', handleEnded)
    audioRef.current.addEventListener('error', handleError)
    audioRef.current.addEventListener('loadstart', handleLoadStart)

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        audioRef.current.removeEventListener('ended', handleEnded)
        audioRef.current.removeEventListener('error', handleError)
        audioRef.current.removeEventListener('loadstart', handleLoadStart)
        audioRef.current = null
      }
    }
  }, [isLoop])

  // Update audio source when playlist changes (for regular audio files only)
  useEffect(() => {
    if (!currentPlaylist?.audio_url) return
    // Skip embeddable URLs (YouTube/Spotify) - they use iframe
    if (isEmbeddableUrl(currentPlaylist.audio_url)) return
    
    if (audioRef.current) {
      audioRef.current.src = currentPlaylist.audio_url
      audioRef.current.load()
      
      if (autoPlay) {
        audioRef.current.play().catch(() => {
          setError('Failed to play audio')
        })
        setIsPlaying(true)
      }
    }
  }, [currentPlaylist, autoPlay])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // Update muted state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  const play = useCallback(async () => {
    if (!currentPlaylist) {
      setError('No playlist selected')
      return
    }

    if (!currentPlaylist.audio_url) {
      setError('Playlist has no audio URL.')
      return
    }

    // Không cố play nội bộ các dịch vụ streaming ngoài
    const url = currentPlaylist.audio_url
    const lower = url.toLowerCase()
    if (
      lower.includes('open.spotify.com') ||
      lower.includes('music.apple.com') ||
      lower.includes('music.youtube.com')
    ) {
      setError('Playlist này phát qua dịch vụ ngoài.')
      setIsPlaying(false)
      return
    }

    // YouTube được embed qua iframe, không cần play từ hook
    if (isYouTubeUrl(currentPlaylist.audio_url)) {
      // Không làm gì, user sẽ click play trực tiếp trên iframe
      return
    }

    try {
      if (audioRef.current) {
        await audioRef.current.play()
        setIsPlaying(true)
        setError(null)
      } else {
        setError('Audio player not initialized')
      }
    } catch (err) {
      setError('Failed to play audio')
      setIsPlaying(false)
    }
  }, [currentPlaylist])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
  }, [])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
    setCurrentTime(time)
  }, [])

  // Next playlist
  const next = useCallback(() => {
    if (playlists.length === 0) return
    
    const nextIndex = currentIndex < playlists.length - 1 ? currentIndex + 1 : 0
    const nextPlaylist = playlists[nextIndex]
    
    setCurrentPlaylist(nextPlaylist)
    setCurrentIndex(nextIndex)
    setCurrentTime(0)
  }, [playlists, currentIndex])

  // Previous playlist
  const previous = useCallback(() => {
    if (playlists.length === 0) return
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlists.length - 1
    const prevPlaylist = playlists[prevIndex]
    
    setCurrentPlaylist(prevPlaylist)
    setCurrentIndex(prevIndex)
    setCurrentTime(0)
  }, [playlists, currentIndex])

  const setPlaylist = useCallback((playlist: MusicPlaylist | null) => {
    setCurrentPlaylist(playlist)
    setCurrentTime(0)
    setIsPlaying(false)
    setError(null)
  }, [])

  const toggleLoop = useCallback(() => {
    setIsLoop((prev: boolean) => !prev)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev)
  }, [])

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [])

  return {
    // State
    currentPlaylist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoop,
    isMuted,
    isLoading,
    error,

    // Actions
    play,
    pause,
    togglePlayPause,
    stop,
    seek,
    next,
    previous,
    setPlaylist,
    setVolume,
    toggleLoop,
    toggleMute,
    formatTime,
  }
}
