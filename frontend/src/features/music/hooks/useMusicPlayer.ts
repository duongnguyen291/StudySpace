/**
 * Music Player Hook
 * Manages music player state and playback logic
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import type { MusicPlaylist } from '../types/music.types'

interface UseMusicPlayerProps {
  initialPlaylist?: MusicPlaylist | null
  autoPlay?: boolean
}

export const useMusicPlayer = ({
  initialPlaylist = null,
  autoPlay = false
}: UseMusicPlayerProps = {}) => {
  const [currentPlaylist, setCurrentPlaylist] = useState<MusicPlaylist | null>(initialPlaylist)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50) // 0-100
  const [isLoop, setIsLoop] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
      
      // Event listeners
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0)
        setIsLoading(false)
      })

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })

      audioRef.current.addEventListener('ended', () => {
        if (isLoop) {
          audioRef.current?.play()
        } else {
          setIsPlaying(false)
          setCurrentTime(0)
        }
      })

      audioRef.current.addEventListener('error', () => {
        setError('Failed to load audio')
        setIsLoading(false)
        setIsPlaying(false)
      })

      audioRef.current.addEventListener('loadstart', () => {
        setIsLoading(true)
        setError(null)
      })

      // Cleanup
      return () => {
        audioRef.current?.pause()
        audioRef.current = null
      }
    }
  }, [isLoop])

  // Update audio source when playlist changes
  useEffect(() => {
    if (audioRef.current && currentPlaylist?.audio_url) {
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
    if (!audioRef.current || !currentPlaylist?.audio_url) {
      setError('No playlist selected')
      return
    }

    try {
      await audioRef.current.play()
      setIsPlaying(true)
      setError(null)
    } catch (err) {
      setError('Failed to play audio')
      setIsPlaying(false)
    }
  }, [currentPlaylist])

  const pause = useCallback(() => {
    audioRef.current?.pause()
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
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setPlaylist = useCallback((playlist: MusicPlaylist | null) => {
    setCurrentPlaylist(playlist)
    setCurrentTime(0)
    setIsPlaying(false)
    setError(null)
  }, [])

  const toggleLoop = useCallback(() => {
    setIsLoop((prev) => !prev)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [])

  return {
    // State
    currentPlaylist,
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
    setPlaylist,
    setVolume,
    toggleLoop,
    toggleMute,
    formatTime
  }
}