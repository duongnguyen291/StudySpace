/**
 * useTaskMutations Hook
 * Handle task CRUD operations including bulk actions
 */
'use client'
import { useState } from 'react'
import { taskService } from '../services/taskService'
import type { TaskCreate, TaskUpdate } from '../types/task.types'

export function useTaskMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTask = async (data: TaskCreate) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await taskService.createTask(data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (id: string, data: TaskUpdate) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await taskService.updateTask(id, data)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await taskService.toggleTask(id)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle task'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await taskService.deleteTask(id)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const bulkDelete = async (taskIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await taskService.bulkDelete(taskIds)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tasks'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const bulkComplete = async (taskIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await taskService.bulkComplete(taskIds)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete tasks'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const bulkUncomplete = async (taskIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await taskService.bulkUncomplete(taskIds)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to uncomplete tasks'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    bulkDelete,
    bulkComplete,
    bulkUncomplete,
    loading,
    error,
  }
}