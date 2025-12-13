'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeatmapData {
  date: string // YYYY-MM-DD
  value: number // minutes
}

interface HeatmapCalendarProps {
  data: HeatmapData[]
  startDate?: Date
  endDate?: Date
}

export function HeatmapCalendar({ data, startDate, endDate }: HeatmapCalendarProps) {
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())

  // Calculate start and end of selected month
  const monthStart = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1)
  }, [selectedYear, selectedMonth])

  const monthEnd = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0)
  }, [selectedYear, selectedMonth])

  // Get available months/years from data
  const availableMonths = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const monthSet = new Set<string>()
    data.forEach(item => {
      const date = new Date(item.date)
      monthSet.add(`${date.getFullYear()}-${date.getMonth()}`)
    })
    
    return Array.from(monthSet)
      .map(str => {
        const [year, month] = str.split('-').map(Number)
        return { year, month }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
  }, [data])

  // Filter data for selected month
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.filter((item: HeatmapData) => {
      const date = new Date(item.date)
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    })
  }, [data, selectedMonth, selectedYear])

  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    filteredData.forEach((item: HeatmapData) => {
      map.set(item.date, item.value)
    })
    return map
  }, [filteredData])

  // Generate all dates in selected month
  const dates = useMemo(() => {
    const datesList: { date: Date; value: number }[] = []
    const current = new Date(monthStart)
    current.setHours(0, 0, 0, 0)
    const end = new Date(monthEnd)
    end.setHours(23, 59, 59, 999)
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      datesList.push({
        date: new Date(current),
        value: dataMap.get(dateStr) || 0
      })
      current.setDate(current.getDate() + 1)
    }
    
    return datesList
  }, [monthStart, monthEnd, dataMap])

  // Calculate max value for color intensity
  const maxValue = useMemo(() => {
    return Math.max(...dates.map((d: { date: Date; value: number }) => d.value), 1)
  }, [dates])

  // Get color based on value
  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-800'
    
    const intensity = value / maxValue
    if (intensity < 0.25) return 'bg-green-900'
    if (intensity < 0.5) return 'bg-green-700'
    if (intensity < 0.75) return 'bg-green-500'
    return 'bg-green-400'
  }

  // Group dates by week (Sunday to Saturday) - ensure each week has exactly 7 days
  const weeks = useMemo(() => {
    const weeksList: { date: Date; value: number }[][] = []
    
    if (dates.length === 0) return weeksList
    
    const firstDay = dates[0].date
    const lastDay = dates[dates.length - 1].date
    
    // Find the Sunday of the week containing the first day
    const firstDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
    const weekStart = new Date(firstDay)
    weekStart.setDate(weekStart.getDate() - firstDayOfWeek)
    
    // Find the Saturday of the week containing the last day
    const lastDayOfWeek = lastDay.getDay()
    const weekEnd = new Date(lastDay)
    weekEnd.setDate(weekEnd.getDate() + (6 - lastDayOfWeek))
    
    // Create a map for quick lookup
    const dateValueMap = new Map<string, number>()
    dates.forEach((item: { date: Date; value: number }) => {
      const dateStr = item.date.toISOString().split('T')[0]
      dateValueMap.set(dateStr, item.value)
    })
    
    // Generate all days from weekStart to weekEnd
    let currentDate = new Date(weekStart)
    let currentWeek: { date: Date; value: number }[] = []
    
    while (currentDate <= weekEnd) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayOfWeek = currentDate.getDay()
      
      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksList.push(currentWeek)
        currentWeek = []
      }
      
      currentWeek.push({
        date: new Date(currentDate),
        value: dateValueMap.get(dateStr) || 0
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Add the last week if it exists
    if (currentWeek.length > 0) {
      // Ensure last week has 7 days
      while (currentWeek.length < 7) {
        const lastDate = new Date(currentWeek[currentWeek.length - 1].date)
        lastDate.setDate(lastDate.getDate() + 1)
        currentWeek.push({ date: lastDate, value: 0 })
      }
      weeksList.push(currentWeek)
    }
    
    return weeksList
  }, [dates])

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  const monthNamesShort = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const canGoPrevious = useMemo(() => {
    return availableMonths.some((m: { year: number; month: number }) => 
      m.year < selectedYear || (m.year === selectedYear && m.month < selectedMonth)
    )
  }, [availableMonths, selectedYear, selectedMonth])

  const canGoNext = useMemo(() => {
    return availableMonths.some((m: { year: number; month: number }) => 
      m.year > selectedYear || (m.year === selectedYear && m.month > selectedMonth)
    )
  }, [availableMonths, selectedYear, selectedMonth])

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">📅 Lịch hoạt động</h3>
          
          {/* Month selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviousMonth}
              disabled={!canGoPrevious}
              className={`p-1.5 rounded-lg transition-colors ${
                canGoPrevious
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-white font-medium min-w-[140px] text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </div>
            
            <button
              onClick={handleNextMonth}
              disabled={!canGoNext}
              className={`p-1.5 rounded-lg transition-colors ${
                canGoNext
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400">Màu sắc càng sáng = học tập càng nhiều</p>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="flex gap-2 w-full">
          {/* Calendar grid */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Day labels */}
            <div className="flex justify-evenly mb-1">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day: string) => (
                <div key={day} className="w-8 h-5 flex items-center justify-center text-xs text-gray-500 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week: { date: Date; value: number }[], weekIndex: number) => (
              <div key={weekIndex} className="flex justify-evenly w-full">
                {week.map((item: { date: Date; value: number }, dayIndex: number) => {
                  const dateStr = item.date.toISOString().split('T')[0]
                  const isToday = dateStr === new Date().toISOString().split('T')[0]
                  const isCurrentMonth = item.date.getMonth() === selectedMonth && item.date.getFullYear() === selectedYear
                  
                  return (
                    <div
                      key={`${dateStr}-${dayIndex}`}
                      className={`w-8 h-8 rounded ${getColor(item.value)} ${
                        !isCurrentMonth ? 'opacity-30' : ''
                      } ${
                        isToday ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-800' : ''
                      } transition-all hover:scale-110 cursor-pointer group relative`}
                      title={isCurrentMonth ? `${dateStr}: ${item.value} phút` : ''}
                    >
                      {/* Tooltip */}
                      {isCurrentMonth && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap border border-gray-700 shadow-lg">
                            <div className="font-semibold">{dateStr}</div>
                            <div>{item.value} phút</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
        <span className="font-medium">Ít hơn</span>
        <div className="flex gap-2">
          <div className="w-4 h-4 rounded bg-gray-800"></div>
          <div className="w-4 h-4 rounded bg-green-900"></div>
          <div className="w-4 h-4 rounded bg-green-700"></div>
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <div className="w-4 h-4 rounded bg-green-400"></div>
        </div>
        <span className="font-medium">Nhiều hơn</span>
      </div>
    </div>
  )
}

