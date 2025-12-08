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
      const data = await profileService.getProfile()
      setProfile(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch profile')
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

