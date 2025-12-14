'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendData {
  current: number
  previous: number
  label: string
  unit?: string
}

interface ProductivityTrendsProps {
  weeklyTrend?: TrendData
  monthlyTrend?: TrendData
  growthRate?: number
}

export function ProductivityTrends({ weeklyTrend, monthlyTrend, growthRate }: ProductivityTrendsProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const weeklyChange = weeklyTrend ? calculateChange(weeklyTrend.current, weeklyTrend.previous) : 0
  const monthlyChange = monthlyTrend ? calculateChange(monthlyTrend.current, monthlyTrend.previous) : 0

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">📈 Xu hướng năng suất</h3>

      <div className="space-y-4">
        {/* Weekly Comparison */}
        {weeklyTrend && (
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Tuần này vs Tuần trước</span>
              <div className={`flex items-center gap-1 ${getTrendColor(weeklyChange)}`}>
                {getTrendIcon(weeklyChange)}
                <span className="text-sm font-semibold">
                  {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Tuần này</div>
                <div className="text-xl font-bold text-white">
                  {weeklyTrend.current.toLocaleString()} {weeklyTrend.unit || 'phút'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tuần trước</div>
                <div className="text-xl font-bold text-gray-400">
                  {weeklyTrend.previous.toLocaleString()} {weeklyTrend.unit || 'phút'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Comparison */}
        {monthlyTrend && (
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Tháng này vs Tháng trước</span>
              <div className={`flex items-center gap-1 ${getTrendColor(monthlyChange)}`}>
                {getTrendIcon(monthlyChange)}
                <span className="text-sm font-semibold">
                  {monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Tháng này</div>
                <div className="text-xl font-bold text-white">
                  {monthlyTrend.current.toLocaleString()} {monthlyTrend.unit || 'phút'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tháng trước</div>
                <div className="text-xl font-bold text-gray-400">
                  {monthlyTrend.previous.toLocaleString()} {monthlyTrend.unit || 'phút'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Growth Rate */}
        {growthRate !== undefined && (
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Tốc độ tăng trưởng</div>
                <div className="text-2xl font-bold text-white">
                  {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                </div>
              </div>
              <div className={`text-4xl ${getTrendColor(growthRate)}`}>
                {getTrendIcon(growthRate)}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Dựa trên xu hướng 30 ngày gần đây
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

