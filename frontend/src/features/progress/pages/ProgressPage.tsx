'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useProgress } from '../hooks/useProgress'
import { ProgressSummaryCard } from '../components/ProgressSummary'
import { WeekFilter } from '../components/WeekFilter'
import { ProgressBarChart } from '../components/ProgressBarChart'
import { ProgressPieChart } from '../components/ProgressPieChart'
import { TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import type { ProgressFilter } from '../types/progress.types'

export default function ProgressPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { progressData, isLoading, error, fetchProgress } = useProgress()
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchProgress({
        filter_week: true,
        week_offset: weekOffset,
      })
    }
  }, [isAuthenticated, authLoading, weekOffset, fetchProgress])

  const handleWeekChange = (offset: number) => {
    setWeekOffset(offset)
  }

  const handleRefresh = () => {
    fetchProgress({
      filter_week: true,
      week_offset: weekOffset,
    })
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Bạn cần đăng nhập để xem tiến độ học tập
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">Lỗi: {error.message}</p>
          <Button onClick={handleRefresh}>Thử lại</Button>
        </div>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Không có dữ liệu để hiển thị
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 md:ml-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-8 h-8" />
                Progress Tracker
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Theo dõi tiến độ học tập của bạn theo tuần/ngày
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Week Filter */}
        <WeekFilter
          weekOffset={weekOffset}
          weekStart={progressData.week_start}
          weekEnd={progressData.week_end}
          onWeekChange={handleWeekChange}
        />

        {/* Summary Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tổng quan
          </h2>
          <ProgressSummaryCard
            summary={progressData.summary}
            isWeekly
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div>
            <ProgressBarChart
              data={progressData.daily_progress}
              title="Tiến độ học tập theo ngày"
            />
          </div>

          {/* Pie Chart */}
          <div>
            <ProgressPieChart
              data={progressData.session_type_stats}
              title="Phân bổ thời gian học theo loại"
            />
          </div>
        </div>

        {/* Empty State */}
        {progressData.daily_progress.every(
          (day) => day.total_minutes === 0 && day.total_quizzes === 0
        ) && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có dữ liệu trong tuần này
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Hãy bắt đầu học để theo dõi tiến độ của bạn!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

