'use client'

import { useEffect, useRef } from 'react'

interface YouTubeBackgroundProps {
  videoId: string
  className?: string
}

/**
 * Extract YouTube video ID from URL
 */
const extractVideoId = (url: string): string | null => {
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

export const YouTubeBackground = ({ videoId, className = '' }: YouTubeBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoIdExtracted = extractVideoId(videoId) || videoId

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
    >
      <iframe
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77777778vh] h-[56.25vw] min-w-full min-h-full"
        src={`https://www.youtube.com/embed/${videoIdExtracted}?autoplay=1&mute=1&loop=1&playlist=${videoIdExtracted}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`}
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{ pointerEvents: 'none' }}
        title="Background Video"
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
    </div>
  )
}

