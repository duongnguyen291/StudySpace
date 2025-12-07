/**
 * useProgress Hook
 * Custom hook for managing progress data
 */
import { useState, useEffect, useCallback } from 'react'
import { progressService } from '../services/progressService'
import type {
  WeeklyProgressResponse,
  ProgressSummary,
  ProgressFilter,
} from '../types/progress.types'

export const useProgress = () => {
  const [progressData, setProgressData] = useState<WeeklyProgressResponse | null>(null)
  const [dashboardStats, setDashboardStats] = useState<ProgressSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchProgress = useCallback(async (filter?: ProgressFilter) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await progressService.getProgress(filter)
      setProgressData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch progress'))
      console.error('Error fetching progress:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const stats = await progressService.getDashboardStats()
      setDashboardStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'))
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    progressData,
    dashboardStats,
    isLoading,
    error,
    fetchProgress,
    fetchDashboardStats,
    refetch: () => {
      if (progressData) {
        // Refetch with current filter (if any)
        fetchProgress()
      }
    },
  }
}

