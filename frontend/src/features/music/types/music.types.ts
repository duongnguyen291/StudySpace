/**
 * Music Feature Types
 */

export type PlaylistType = 'lofi' | 'piano' | 'rain' | 'nature' | 'ambient'

export interface MusicPlaylist {
  id: string
  name: string
  description: string | null
  playlist_type: PlaylistType | null
  audio_url: string | null
  thumbnail_url: string | null
  duration_minutes: number | null
  is_active: boolean
  created_at: string
}

export interface MusicPlaylistCreate {
  name: string
  description?: string
  playlist_type?: PlaylistType
  audio_url?: string
  thumbnail_url?: string
  duration_minutes?: number
}

export interface MusicPlaylistUpdate {
  name?: string
  description?: string
  playlist_type?: PlaylistType
  audio_url?: string
  thumbnail_url?: string
  duration_minutes?: number
  is_active?: boolean
}

export interface AudioInfo {
  url: string
  type: 'local' | 'external' | 'youtube' | 'soundcloud' | 'spotify'
  format: string | null
  is_local: boolean
  is_external: boolean
}

export interface AudioAvailability {
  url: string
  available: boolean
  error: string | null
}