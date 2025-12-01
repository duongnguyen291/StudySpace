/**
 * Category Types
 * TypeScript types for category management
 */

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export interface CategoryCreate {
  name: string
  color?: string
  icon?: string
}

export interface CategoryUpdate {
  name?: string
  color?: string
  icon?: string
}

export interface CategoryListResponse {
  categories: Category[]
  total: number
}

