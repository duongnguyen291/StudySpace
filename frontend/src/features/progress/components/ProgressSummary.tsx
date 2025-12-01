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
  const timeLabel = isWeekly ? 'Tuần này' : 'Tổng thời gian'
  const timeMinutes = isWeekly ? summary.week_minutes : summary.total_minutes

  const quizLabel = isWeekly ? 'Quiz tuần này' : 'Tổng quiz'
  const quizCount = isWeekly ? summary.week_quizzes : summary.total_quizzes

  const sessionLabel = isWeekly ? 'Sessions tuần này' : 'Tổng sessions'
  const sessionCount = isWeekly ? summary.week_sessions : summary.total_sessions

  const averageLabel = isWeekly ? 'Trung bình/ngày (tuần này)' : 'Trung bình/ngày'
  const averageMinutes =
    isWeekly && summary.average_daily_minutes > 0
      ? summary.average_daily_minutes
      : summary.average_daily_minutes

  const stats = [
    {
      label: timeLabel,
      value: formatMinutes(timeMinutes),
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: quizLabel,
      value: quizCount.toString(),
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: sessionLabel,
      value: sessionCount.toString(),
      icon: BookOpen,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: averageLabel,
      value: formatMinutes(averageMinutes),
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

