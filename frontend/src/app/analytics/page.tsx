'use client'

import { useRouter } from 'next/navigation'
import { useProfile } from '@/features/profile'
import { Button } from '@/shared/components/Button'
import { ArrowLeft, Clock, TrendingUp, Target, Calendar } from 'lucide-react'
import { Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thống kê...</p>
        </div>
      </div>
    )
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thống kê học tập</h1>
        </div>

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Study Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tổng thời gian học</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatHours(profile.total_study_hours)}
                  </p>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Thành viên từ</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Login */}
            {profile.last_login && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Đăng nhập lần cuối</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDate(profile.last_login)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Target className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Thống kê chi tiết đang được phát triển
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Chúng tôi đang làm việc để mang đến cho bạn biểu đồ và phân tích chi tiết hơn về tiến độ học tập.
          </p>
        </div>
      </div>
    </div>
  )
}

