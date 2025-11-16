/**
 * Global TypeScript types
 */

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

