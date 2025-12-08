'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { useProfile, AvatarUpload } from '@/features/profile'
import { Button } from '@/shared/components/Button'
import { Loader2, Save, ArrowLeft, Clock, Mail, User } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const { profile, loading, error, updateProfile, uploadAvatar, deleteAvatar } = useProfile()
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState<string | null>(null)

  // Update username field when profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Về trang chủ
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const handleSave = async () => {
    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      setSaveError('Tên người dùng không được để trống')
      setSaveSuccessMessage(null)
      return
    }

    try {
      setSaving(true)
      setSaveError(null)
      setSaveSuccessMessage(null)
      
      // Always update, even if no changes (to show success message)
      await updateProfile({ username: trimmedUsername })
      
      // Update local state with trimmed username
      setUsername(trimmedUsername)
      
      // Show success message
      setSaveSuccessMessage('Lưu thay đổi thành công')
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveSuccessMessage(null)
      }, 3000)
    } catch (err) {
      setSaveError('Không thể cập nhật thông tin')
      setSaveSuccessMessage(null)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    if (h > 0 && m > 0) {
      return `${h} giờ ${m} phút`
    } else if (h > 0) {
      return `${h} giờ`
    } else if (m > 0) {
      return `${m} phút`
    }
    return '0 phút'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 md:ml-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hồ sơ của tôi</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          {/* Avatar Section */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Ảnh đại diện
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ảnh sẽ được lưu tự động sau khi bạn chọn
              </p>
            </div>
            <AvatarUpload
              currentAvatarUrl={profile.avatar_url}
              onUpload={async (file) => {
                try {
                  await uploadAvatar(file)
                  setAvatarSuccessMessage('Thay đổi ảnh đại diện thành công')
                  // Clear message after 3 seconds
                  setTimeout(() => {
                    setAvatarSuccessMessage(null)
                  }, 3000)
                } catch (err) {
                  // Error is handled by useProfile hook
                }
              }}
              onDelete={async () => {
                try {
                  await deleteAvatar()
                  setAvatarSuccessMessage('Xóa ảnh đại diện thành công')
                  setTimeout(() => {
                    setAvatarSuccessMessage(null)
                  }, 3000)
                } catch (err) {
                  // Error is handled by useProfile hook
                }
              }}
              disabled={saving}
            />
            {avatarSuccessMessage && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400 text-center">
                  ✓ {avatarSuccessMessage}
                </p>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Tên người dùng
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Nhấn "Lưu thay đổi" bên dưới để cập nhật tên người dùng
              </p>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setSaveError(null)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên người dùng"
              />
              {saveError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{saveError}</p>
              )}
              {saveSuccessMessage && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ {saveSuccessMessage}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email không thể thay đổi
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving || !profile || !username.trim()}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Thống kê học tập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng thời gian học</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatHours(profile.total_study_hours)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <User className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Thành viên từ</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>

            {profile.last_login && (
              <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Đăng nhập lần cuối</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatDate(profile.last_login)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

