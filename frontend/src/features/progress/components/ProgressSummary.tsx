'use client'

import { Clock, CheckCircle2, BookOpen, TrendingUp } from 'lucide-react'
import type { ProgressSummary } from '../types/progress.types'

interface ProgressSummaryProps {
  summary: ProgressSummary
  isWeekly?: boolean
}

export const ProgressSummaryCard = ({
  summary,
  isWeekly = false,
}: ProgressSummaryProps) => {
  const stats = [
    {
      label: isWeekly ? 'Tuần này' : 'Tổng thời gian',
      value: formatMinutes(summary.week_minutes || summary.total_minutes),
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: isWeekly ? 'Quiz tuần này' : 'Tổng quiz',
      value: (summary.week_quizzes || summary.total_quizzes).toString(),
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: isWeekly ? 'Sessions tuần này' : 'Tổng sessions',
      value: (summary.week_sessions || summary.total_sessions).toString(),
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Trung bình/ngày',
      value: formatMinutes(
        summary.average_daily_minutes || summary.total_minutes / 30
      ),
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

