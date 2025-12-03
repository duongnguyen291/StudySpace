/**
 * Music Service
 * API calls for Music feature
 */
import { apiClient } from '@/shared/utils/api'
import type {
  MusicPlaylist,
  MusicPlaylistCreate,
  MusicPlaylistUpdate,
  AudioInfo,
  AudioAvailability
} from '../types/music.types'

const BASE_URL = '/music'

export const musicService = {
  async getPlaylists(
    playlistType?: string,
    skip = 0,
    limit = 100
  ): Promise<MusicPlaylist[]> {
    const response = await apiClient.get(`${BASE_URL}/playlists`, {
      params: { playlist_type: playlistType, skip, limit }
    })
    return response.data
  },

  async getPlaylist(playlistId: string): Promise<MusicPlaylist> {
    const response = await apiClient.get(`${BASE_URL}/playlists/${playlistId}`)
    return response.data
  },

  async createPlaylist(data: MusicPlaylistCreate): Promise<MusicPlaylist> {
    const response = await apiClient.post(`${BASE_URL}/playlists`, data)
    return response.data
  },

  async updatePlaylist(
    playlistId: string,
    data: MusicPlaylistUpdate
  ): Promise<MusicPlaylist> {
    const response = await apiClient.put(`${BASE_URL}/playlists/${playlistId}`, data)
    return response.data
  },

  async deletePlaylist(playlistId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/playlists/${playlistId}`)
  },

  async getAudioInfo(url: string): Promise<AudioInfo> {
    const response = await apiClient.get(`${BASE_URL}/audio/info`, {
      params: { url }
    })
    return response.data
  },

  async checkAudioAvailability(url: string): Promise<AudioAvailability> {
    const response = await apiClient.get(`${BASE_URL}/audio/check`, {
      params: { url }
    })
    return response.data
  }
}