/**
 * Task Service
 * API client for task management (using shared apiClient)
 */
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TaskFilter,
  TaskStats,
  BulkActionResponse,
} from '../types/task.types'

import { API_ENDPOINTS } from '@/shared/constants'
import { apiClient } from "@/shared/utils/api";
class TaskService {
  /**
   * Build query params from TaskFilter
   */
  private buildParams(filters?: TaskFilter) {
    if (!filters) return undefined

    const params: Record<string, any> = {}

    if (filters.category_id) params.category_id = filters.category_id
    if (filters.priority) params.priority = filters.priority
    if (filters.completed !== undefined) params.completed = filters.completed
    if (filters.search) params.search = filters.search
    if (filters.page) params.page = filters.page
    if (filters.page_size) params.page_size = filters.page_size
    if (filters.sort_by) params.sort_by = filters.sort_by
    if (filters.sort_order) params.sort_order = filters.sort_order

    return params
  }

  async getTasks(filters?: TaskFilter): Promise<TaskListResponse | null> {
    try {
      const params = this.buildParams(filters)

      const response = await apiClient.get<TaskListResponse>(
        API_ENDPOINTS.TASKS.BASE,
        { params }
      )

      return response.data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      const response = await apiClient.get<Task>(
        API_ENDPOINTS.TASKS.BY_ID(id)
      )
      return response.data
    } catch (error) {
      console.error('Error fetching task:', error)
      throw error
    }
  }

  async createTask(data: TaskCreate): Promise<Task | null> {
    try {
      const response = await apiClient.post<Task>(
        API_ENDPOINTS.TASKS.BASE,
        data
      )
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  async updateTask(id: string, data: TaskUpdate): Promise<Task | null> {
    try {
      const response = await apiClient.put<Task>(
        API_ENDPOINTS.TASKS.BY_ID(id),
        data
      )
      return response.data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  async toggleTask(id: string): Promise<Task | null> {
    try {
      const response = await apiClient.patch<Task>(
        API_ENDPOINTS.TASKS.TOGGLE(id),
        {}
      )
      return response.data
    } catch (error) {
      console.error('Error toggling task:', error)
      throw error
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await apiClient.delete(
        API_ENDPOINTS.TASKS.BY_ID(id)
      )
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  async getStats(): Promise<TaskStats | null> {
    try {
      const response = await apiClient.get<TaskStats>(
        API_ENDPOINTS.TASKS.STATS
      )
      return response.data
    } catch (error) {
      console.error('Error fetching task stats:', error)
      throw error
    }
  }

  async bulkDelete(taskIds: string[]): Promise<BulkActionResponse | null> {
    try {
      const response = await apiClient.post<BulkActionResponse>(
        API_ENDPOINTS.TASKS.BULK_DELETE,
        { task_ids: taskIds }
      )
      return response.data
    } catch (error) {
      console.error('Error bulk deleting tasks:', error)
      throw error
    }
  }

  async bulkComplete(taskIds: string[]): Promise<BulkActionResponse | null> {
    try {
      const response = await apiClient.post<BulkActionResponse>(
        API_ENDPOINTS.TASKS.BULK_COMPLETE,
        { task_ids: taskIds }
      )
      return response.data
    } catch (error) {
      console.error('Error bulk completing tasks:', error)
      throw error
    }
  }

  async bulkUncomplete(taskIds: string[]): Promise<BulkActionResponse | null> {
    try {
      const response = await apiClient.post<BulkActionResponse>(
        API_ENDPOINTS.TASKS.BULK_UNCOMPLETE,
        { task_ids: taskIds }
      )
      return response.data
    } catch (error) {
      console.error('Error bulk uncompleting tasks:', error)
      throw error
    }
  }
}

export const taskService = new TaskService()
