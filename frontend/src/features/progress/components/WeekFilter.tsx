'use client'

import { Button } from '@/shared/components/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekFilterProps {
  weekOffset: number
  weekStart: string
  weekEnd: string
  onWeekChange: (offset: number) => void
}

export const WeekFilter = ({
  weekOffset,
  weekStart,
  weekEnd,
  onWeekChange,
}: WeekFilterProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getWeekLabel = (offset: number) => {
    if (offset === 0) return 'Tuần này'
    if (offset === -1) return 'Tuần trước'
    if (offset > 0) return `Tuần tới (+${offset})`
    return `Cách đây ${Math.abs(offset)} tuần`
  }

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(weekOffset - 1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Trước
        </Button>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {getWeekLabel(weekOffset)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(weekOffset + 1)}
          disabled={weekOffset >= 0}
          className="flex items-center gap-1"
        >
          Sau
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Button
        variant={weekOffset === 0 ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => onWeekChange(0)}
      >
        Tuần này
      </Button>
    </div>
  )
}

