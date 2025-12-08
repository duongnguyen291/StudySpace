/**
 * Profile Hook
 * Manages profile state and operations
 */
import { useState, useEffect } from 'react'
import { profileService, Profile, ProfileUpdate } from '../services/profileService'

interface UseProfileReturn {
  profile: Profile | null
  loading: boolean
  error: string | null
  updateProfile: (data: ProfileUpdate) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  deleteAvatar: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('Bạn cần đăng nhập để xem hồ sơ')
        setProfile(null)
        setLoading(false)
        return
      }
      
      const data = await profileService.getProfile()
      setProfile(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Không thể tải thông tin hồ sơ'
      
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        // Clear token and redirect will be handled by api interceptor
      } else {
        setError(errorMessage)
      }
      
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const updateProfile = async (data: ProfileUpdate) => {
    try {
      setError(null)
      const updated = await profileService.updateProfile(data)
      setProfile(updated)
      // Trigger window event to refresh auth user data
      window.dispatchEvent(new Event('profile-updated'))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile')
      throw err
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      setError(null)
      const updated = await profileService.uploadAvatar(file)
      setProfile(updated)
      // Trigger window event to refresh auth user data
      window.dispatchEvent(new Event('profile-updated'))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload avatar')
      throw err
    }
  }

  const deleteAvatar = async () => {
    try {
      setError(null)
      await profileService.deleteAvatar()
      if (profile) {
        setProfile({ ...profile, avatar_url: null })
      }
      // Trigger window event to refresh auth user data
      window.dispatchEvent(new Event('profile-updated'))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete avatar')
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refreshProfile: fetchProfile,
  }
}

