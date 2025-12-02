/**
 * Category Service
 * API client for category management
 */
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryListResponse,
} from '../types/category.types'

import { API_ENDPOINTS } from '@/shared/constants'
import { apiClient } from '@/shared/utils/api'

class CategoryService {
  async getCategories(): Promise<CategoryListResponse | null> {
    try {
      const response = await apiClient.get<CategoryListResponse>(
        API_ENDPOINTS.CATEGORIES.BASE
      )
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  async getCategory(id: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<Category>(
        API_ENDPOINTS.CATEGORIES.BY_ID(id)
      )
      return response.data
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  }

  async createCategory(data: CategoryCreate): Promise<Category | null> {
    try {
      const response = await apiClient.post<Category>(
        API_ENDPOINTS.CATEGORIES.BASE,
        data
      )
      return response.data
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  async updateCategory(id: string, data: CategoryUpdate): Promise<Category | null> {
    try {
      const response = await apiClient.put<Category>(
        API_ENDPOINTS.CATEGORIES.BY_ID(id),
        data
      )
      return response.data
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await apiClient.delete(
        API_ENDPOINTS.CATEGORIES.BY_ID(id)
      )
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }
}

export const categoryService = new CategoryService()

