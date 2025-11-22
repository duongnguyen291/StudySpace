/**
 * Background Hook
 * Manages YouTube background video URL
 */
import { useState, useEffect } from 'react'

const DEFAULT_YOUTUBE_URL = 'https://www.youtube.com/watch?v=zF-__3RANT4'
const STORAGE_KEY = 'studyspace_youtube_background'

export const useBackground = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>(DEFAULT_YOUTUBE_URL)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setYoutubeUrl(saved)
    }
  }, [])

  const updateBackground = (url: string) => {
    setYoutubeUrl(url)
    localStorage.setItem(STORAGE_KEY, url)
  }

  const resetToDefault = () => {
    setYoutubeUrl(DEFAULT_YOUTUBE_URL)
    localStorage.setItem(STORAGE_KEY, DEFAULT_YOUTUBE_URL)
  }

  return {
    youtubeUrl,
    updateBackground,
    resetToDefault,
  }
}

