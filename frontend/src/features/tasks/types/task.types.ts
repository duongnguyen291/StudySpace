/**
 * Task Types
 * TypeScript types for task management
 */

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  user_id: string
  category_id?: string | null
  title: string
  description?: string | null
  priority: TaskPriority
  completed: boolean
  completed_at?: string | null
  due_date?: string | null
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string
  category_id?: string
  priority?: TaskPriority
  due_date?: string
}

export interface TaskUpdate {
  title?: string
  description?: string
  category_id?: string
  priority?: TaskPriority
  due_date?: string
  completed?: boolean
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  page_size: number
  has_next: boolean
  has_prev: boolean
}

export interface TaskFilter {
  category_id?: string
  priority?: TaskPriority
  completed?: boolean
  search?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  completion_rate: number
}

export interface BulkActionResponse {
  success: boolean
  affected_count: number
  message: string
}