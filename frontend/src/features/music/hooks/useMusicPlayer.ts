/**
 * Music Player Hook
 * Manages music player state and playback logic
 * Supports both regular audio files and YouTube videos
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import type { MusicPlaylist } from '../types/music.types'

interface UseMusicPlayerProps {
  initialPlaylist?: MusicPlaylist | null
  playlists?: MusicPlaylist[]  // ✅ Thêm playlists list
  autoPlay?: boolean
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
    if (match && match[1]) {
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
 * Check if URL is YouTube
 */
const isYouTubeUrl = (url: string | null): boolean => {
  if (!url) return false
  return url.includes('youtube.com') || url.includes('youtu.be') || extractVideoId(url) !== null
}

export const useMusicPlayer = ({
  initialPlaylist = null,
  playlists = [],  // ✅ Thêm playlists
  autoPlay = false
}: UseMusicPlayerProps = {}) => {
  const [currentPlaylist, setCurrentPlaylist] = useState<MusicPlaylist | null>(initialPlaylist)
  const [currentIndex, setCurrentIndex] = useState(-1)  // ✅ Thêm currentIndex
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50) // 0-100
  const [isLoop, setIsLoop] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const youtubePlayerRef = useRef<any>(null)  // YouTube Player instance
  const youtubeIframeRef = useRef<HTMLDivElement | null>(null)

  // ✅ Thêm: Sync currentPlaylist với initialPlaylist khi prop thay đổi
  useEffect(() => {
    // Chỉ update nếu initialPlaylist thực sự thay đổi (khác ID hoặc null)
    if (initialPlaylist?.id !== currentPlaylist?.id) {
      setCurrentPlaylist(initialPlaylist)
      setCurrentTime(0)
      setIsPlaying(false)
      setError(null)
    }
  }, [initialPlaylist?.id])  // ✅ Chỉ depend on ID để tránh re-render không cần thiết

  // Find current playlist index
  useEffect(() => {
    if (currentPlaylist && playlists.length > 0) {
      const index = playlists.findIndex(p => p.id === currentPlaylist.id)
      setCurrentIndex(index)
    }
  }, [currentPlaylist, playlists])

  // Load YouTube IFrame Player API
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      // Initialize YouTube Player when API is ready
      ;(window as any).onYouTubeIframeAPIReady = () => {
        if (youtubeIframeRef.current && currentPlaylist?.audio_url) {
          const videoId = extractVideoId(currentPlaylist.audio_url)
          if (videoId) {
            youtubePlayerRef.current = new (window as any).YT.Player(youtubeIframeRef.current, {
              videoId: videoId,
              playerVars: {
                autoplay: autoPlay ? 1 : 0,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                showinfo: 0,
              },
              events: {
                onReady: (event: any) => {
                  setDuration(event.target.getDuration())
                  setIsLoading(false)
                },
                onStateChange: (event: any) => {
                  // YT.PlayerState.PLAYING = 1
                  // YT.PlayerState.PAUSED = 2
                  // YT.PlayerState.ENDED = 0
                  if (event.data === 1) {
                    setIsPlaying(true)
                  } else if (event.data === 2) {
                    setIsPlaying(false)
                  } else if (event.data === 0) {
                    // Video ended
                    if (isLoop) {
                      event.target.playVideo()
                    } else {
                      setIsPlaying(false)
                      setCurrentTime(0)
                    }
                  }
                },
                onError: () => {
                  setError('Failed to load YouTube video')
                  setIsLoading(false)
                  setIsPlaying(false)
                }
              }
            })
          }
        }
      }
    }
  }, [])

  // Initialize audio element for non-YouTube URLs
  useEffect(() => {
    if (typeof window !== 'undefined' && !isYouTubeUrl(currentPlaylist?.audio_url || null)) {
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
    if (!currentPlaylist?.audio_url) return

    const isYouTube = isYouTubeUrl(currentPlaylist.audio_url)

    if (isYouTube) {
      // Handle YouTube
      const videoId = extractVideoId(currentPlaylist.audio_url)
      if (videoId && youtubePlayerRef.current) {
        setIsLoading(true)
        youtubePlayerRef.current.loadVideoById(videoId)
        if (autoPlay) {
          youtubePlayerRef.current.playVideo()
          setIsPlaying(true)
        }
      }
    } else {
      // Handle regular audio
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
    }
  }, [currentPlaylist, autoPlay])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(volume)
    }
  }, [volume])

  // Update muted state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.mute(isMuted)
    }
  }, [isMuted])

  // Update current time for YouTube (polling)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isPlaying && youtubePlayerRef.current) {
      interval = setInterval(() => {
        try {
          const time = youtubePlayerRef.current.getCurrentTime()
          setCurrentTime(time)
        } catch (e) {
          // Player not ready
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  const play = useCallback(async () => {
    if (!currentPlaylist) {
      setError('No playlist selected')
      return
    }

    if (!currentPlaylist.audio_url) {
      setError('Playlist has no audio URL. Please add a YouTube URL or audio file.')
      return
    }

    const isYouTube = isYouTubeUrl(currentPlaylist.audio_url)

    try {
      if (isYouTube && youtubePlayerRef.current) {
        youtubePlayerRef.current.playVideo()
        setIsPlaying(true)
        setError(null)
      } else if (audioRef.current) {
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
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.pauseVideo()
    }
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
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.stopVideo()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  const seek = useCallback((time: number) => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time, true)
    }
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
    setCurrentTime(time)
  }, [])

  // ✅ Next playlist
  const next = useCallback(() => {
    if (playlists.length === 0) return
    
    const nextIndex = currentIndex < playlists.length - 1 ? currentIndex + 1 : 0
    const nextPlaylist = playlists[nextIndex]
    
    setCurrentPlaylist(nextPlaylist)
    setCurrentIndex(nextIndex)
    setCurrentTime(0)
    
    // Auto-play if was playing
    if (isPlaying) {
      setTimeout(() => {
        play()
      }, 100)
    }
  }, [playlists, currentIndex, isPlaying, play])

  // ✅ Previous playlist
  const previous = useCallback(() => {
    if (playlists.length === 0) return
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlists.length - 1
    const prevPlaylist = playlists[prevIndex]
    
    setCurrentPlaylist(prevPlaylist)
    setCurrentIndex(prevIndex)
    setCurrentTime(0)
    
    // Auto-play if was playing
    if (isPlaying) {
      setTimeout(() => {
        play()
      }, 100)
    }
  }, [playlists, currentIndex, isPlaying, play])

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
    currentIndex,  // ✅ Thêm currentIndex
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

    youtubeIframeRef,
  }
}