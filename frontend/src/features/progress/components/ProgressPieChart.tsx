'use client'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import type { SessionTypeStats } from '../types/progress.types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ProgressPieChartProps {
  data: SessionTypeStats[]
  title?: string
}

const SESSION_TYPE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  pomodoro: {
    bg: 'rgba(59, 130, 246, 0.6)',
    border: 'rgba(59, 130, 246, 1)',
    label: 'Pomodoro',
  },
  free_study: {
    bg: 'rgba(16, 185, 129, 0.6)',
    border: 'rgba(16, 185, 129, 1)',
    label: 'Tự học',
  },
  quiz: {
    bg: 'rgba(139, 92, 246, 0.6)',
    border: 'rgba(139, 92, 246, 1)',
    label: 'Quiz',
  },
}

const DEFAULT_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.6)', border: 'rgba(99, 102, 241, 1)' },
  { bg: 'rgba(236, 72, 153, 0.6)', border: 'rgba(236, 72, 153, 1)' },
  { bg: 'rgba(251, 146, 60, 0.6)', border: 'rgba(251, 146, 60, 1)' },
  { bg: 'rgba(34, 197, 94, 0.6)', border: 'rgba(34, 197, 94, 1)' },
]

export const ProgressPieChart = ({
  data,
  title = 'Phân bổ thời gian học theo loại',
}: ProgressPieChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Chưa có dữ liệu để hiển thị
        </p>
      </div>
    )
  }

  const chartData = {
    labels: data.map((item) => {
      const typeConfig = SESSION_TYPE_COLORS[item.session_type] || null
      return typeConfig ? typeConfig.label : item.session_type
    }),
    datasets: [
      {
        label: 'Thời gian (phút)',
        data: data.map((item) => item.total_minutes),
        backgroundColor: data.map((item, index) => {
          const typeConfig = SESSION_TYPE_COLORS[item.session_type]
          return typeConfig
            ? typeConfig.bg
            : DEFAULT_COLORS[index % DEFAULT_COLORS.length].bg
        }),
        borderColor: data.map((item, index) => {
          const typeConfig = SESSION_TYPE_COLORS[item.session_type]
          return typeConfig
            ? typeConfig.border
            : DEFAULT_COLORS[index % DEFAULT_COLORS.length].border
        }),
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const percentage = context.percent || 0
            const dataIndex = context.dataIndex
            const sessions = data[dataIndex]?.session_count || 0
            return [
              `${label}: ${value} phút (${percentage.toFixed(1)}%)`,
              `Số sessions: ${sessions}`,
            ]
          },
        },
      },
    },
  }

  return (
    <div className="w-full h-[400px] p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Pie data={chartData} options={options} />
    </div>
  )
}

