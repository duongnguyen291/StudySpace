/**
 * Profile Service
 * API calls for user profile operations
 */
import { apiClient } from '@/shared/utils/api'

export interface Profile {
  id: string
  email: string
  username: string
  avatar_url: string | null
  total_study_hours: number
  created_at: string
  updated_at: string
  last_login: string | null
}

export interface ProfileUpdate {
  username?: string
  avatar_url?: string | null
}

export const profileService = {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<Profile> {
    const response = await apiClient.get<Profile>('/profile/me')
    return response.data
  },

  /**
   * Update current user's profile
   */
  async updateProfile(data: ProfileUpdate): Promise<Profile> {
    const response = await apiClient.put<Profile>('/profile/me', data)
    return response.data
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: File): Promise<Profile> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<Profile>('/profile/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<void> {
    await apiClient.delete('/profile/me/avatar')
  },
}

