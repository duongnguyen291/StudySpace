/**
 * useTasks Hook
 * Fetch and manage task list
 */
'use client'
import { useEffect, useState, useCallback } from 'react'
import { taskService } from '../services/taskService'
import type { Task, TaskFilter, TaskStats } from '../types/task.types'

export function useTasks(filters?: TaskFilter) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20,
    has_next: false,
    has_prev: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await taskService.getTasks(filters)
      
      if (response) {
        setTasks(response.tasks)
        setPagination({
          total: response.total,
          page: response.page,
          page_size: response.page_size,
          has_next: response.has_next,
          has_prev: response.has_prev,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [
    filters?.category_id,
    filters?.priority,
    filters?.completed,
    filters?.search,
    filters?.page,
    filters?.page_size,
    filters?.sort_by,
    filters?.sort_order,
  ])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await taskService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [fetchTasks, fetchStats])

  return {
    tasks,
    stats,
    pagination,
    loading,
    error,
    refetch: fetchTasks,
    refetchStats: fetchStats,
  }
}