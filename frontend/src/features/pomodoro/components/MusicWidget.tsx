'use client'

/**
 * MusicWidget
 * Nhúng Music Playlist vào ngay trong trang Pomodoro
 * Tận dụng lại PlaylistList + MusicPlayer từ feature music,
 * nhưng tối ưu layout cho vai trò widget hỗ trợ học tập.
 */

import { useEffect, useState } from 'react'
import type React from 'react'
import { MusicPlayer } from '@/features/music/components/MusicPlayer'
import { PlaylistList } from '@/features/music/components/PlaylistList'
import { musicService } from '@/features/music/services/musicService'
import type { MusicPlaylist, PlaylistType } from '@/features/music/types/music.types'
import { cn } from '@/shared/utils/cn'

interface MusicWidgetProps {
  className?: string
}

// Khóa lưu preference đơn giản ở client
const STORAGE_KEY = 'studyspace_music_preferences'

interface MusicPreferences {
  lastPlaylistId?: string
  lastPlaylistType?: PlaylistType | null
  loopEnabled?: boolean
}

export const MusicWidget = ({ className }: MusicWidgetProps) => {
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylist | null>(null)
  const [filterType, setFilterType] = useState<PlaylistType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customUrl, setCustomUrl] = useState('')

  // Load preferences từ localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (!raw) return
      const prefs = JSON.parse(raw) as MusicPreferences
      if (prefs.lastPlaylistType) {
        setFilterType(prefs.lastPlaylistType)
      }
    } catch {
      // ignore parse error
    }
  }, [])

  // Load playlists mỗi khi filterType thay đổi
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await musicService.getPlaylists(filterType || undefined)
        setPlaylists(data)

        // Auto-chọn playlist đầu tiên nếu chưa chọn
        if (!selectedPlaylist && data.length > 0) {
          setSelectedPlaylist(data[0])
        } else if (
          selectedPlaylist &&
          !data.find((p) => p.id === selectedPlaylist.id)
        ) {
          // Nếu playlist đã chọn không còn trong danh sách filter hiện tại → chọn playlist đầu
          setSelectedPlaylist(data[0] ?? null)
        }
      } catch (error) {
        console.error('Failed to load playlists in MusicWidget:', error)
        setSelectedPlaylist(null)
      } finally {
        setIsLoading(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType])

  const handleSelectPlaylist = (playlist: MusicPlaylist) => {
    setSelectedPlaylist(playlist)
    // Lưu preference đơn giản
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      const current: MusicPreferences = raw ? JSON.parse(raw) : {}
      const next: MusicPreferences = {
        ...current,
        lastPlaylistId: playlist.id,
        lastPlaylistType: filterType ?? null
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn(
        'bg-black/40 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-white overflow-hidden',
        // Cố định chiều rộng widget để control & icon không bị "trôi" theo grid
        // Tăng độ rộng card để nội dung thoáng hơn
        'flex flex-col gap-3 max-w-2xl w-full ml-auto',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Music for Focus
          </h3>
          <p className="text-xs text-white/60">
            Nhạc nền nhẹ giúp bạn duy trì trạng thái tập trung.
          </p>
        </div>
      </div>

      {/* URL tùy chọn của user – nếu có sẽ ưu tiên phát theo URL này */}
      <div className="space-y-2">
        <label className="block text-xs text-white/70">
          Dán link YouTube / Spotify nếu bạn có playlist riêng:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
          />
          <button
            type="button"
            onClick={() => {
              const url = customUrl.trim()
              if (!url) return

              const customPlaylist: MusicPlaylist = {
                id: `custom-${Date.now()}`,
                name: 'Custom Playlist',
                description: 'Playlist tuỳ chỉnh từ URL của bạn',
                playlist_type: null,
                audio_url: url,
                thumbnail_url: null,
                duration_minutes: null,
                is_active: true,
                created_at: new Date().toISOString(),
              }

              setSelectedPlaylist(customPlaylist)

              // Lưu lại URL cuối cùng để lần sau gợi ý
              try {
                const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
                const current: MusicPreferences = raw ? JSON.parse(raw) : {}
                const next: MusicPreferences = {
                  ...current,
                  lastPlaylistType: filterType ?? null,
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
              } catch {
                // ignore
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-white text-gray-900 text-xs font-semibold hover:bg-white/90 transition-colors"
          >
            Dùng URL
          </button>
        </div>
      </div>

      {/* Bộ lọc đơn giản theo loại playlist (chỉ áp dụng cho playlist trong database) */}
      <div className="flex flex-wrap gap-1">
        {([null, 'lofi', 'piano', 'rain', 'nature', 'ambient'] as const).map(
          (type) => (
            <button
              key={type ?? 'all'}
              type="button"
              onClick={() => setFilterType(type)}
              className={cn(
                'px-2 py-1 rounded-full text-xs transition-colors',
                filterType === type
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              )}
            >
              {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Danh sách playlist - giới hạn chiều cao, có thanh cuộn nếu > 3 playlist */}
        <div className="max-h-80 overflow-y-auto pr-1 pb-2">
          <PlaylistList
            onSelectPlaylist={handleSelectPlaylist}
            selectedPlaylistId={selectedPlaylist?.id}
            filterType={filterType}
            className="space-y-2"
          />
        </div>

        {/* Player nhỏ gọn - mở rộng để thanh volume có đủ chỗ */}
        <div className="min-w-0">
          <MusicPlayer
            playlist={selectedPlaylist}
            playlists={playlists}
            onPlaylistChange={(newPlaylist) => {
              if (newPlaylist) {
                setSelectedPlaylist(newPlaylist)
              }
            }}
            className="p-4 bg-white/5 border border-white/10 rounded-xl"
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-xs text-white/60 mt-1">Đang tải playlist...</p>
      )}
    </div>
  )
}


