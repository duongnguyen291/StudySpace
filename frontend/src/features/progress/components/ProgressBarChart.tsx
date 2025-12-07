'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { DailyProgress } from '../types/progress.types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ProgressBarChartProps {
  data: DailyProgress[]
  title?: string
}

export const ProgressBarChart = ({
  data,
  title = 'Tiến độ học tập theo ngày',
}: ProgressBarChartProps) => {
  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      })
    }),
    datasets: [
      {
        label: 'Phút học (phút)',
        data: data.map((item) => item.total_minutes),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Số quiz',
        data: data.map((item) => item.total_quizzes),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (context.datasetIndex === 0) {
              return `Phút học: ${context.parsed.y} phút`
            }
            return `Quiz: ${context.parsed.y} bài`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return (
    <div className="w-full h-[400px] p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <Bar data={chartData} options={options} />
    </div>
  )
}

