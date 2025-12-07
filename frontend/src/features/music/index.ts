/**
 * Music Feature Module
 * Public API exports
 */

export { MusicPlayer } from './components/MusicPlayer'
export { PlaylistList } from './components/PlaylistList'

export { useMusicPlayer } from './hooks/useMusicPlayer'

export { musicService } from './services/musicService'

export type {
  MusicPlaylist,
  MusicPlaylistCreate,
  MusicPlaylistUpdate,
  PlaylistType,
  AudioInfo,
  AudioAvailability
} from './types/music.types'