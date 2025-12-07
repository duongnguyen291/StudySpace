/**
 * Progress Service
 * API calls for Progress Tracker feature
 */
import { apiClient } from '@/shared/utils/api'
import type {
  WeeklyProgressResponse,
  ProgressSummary,
  ProgressFilter,
} from '../types/progress.types'

const BASE_URL = '/progress'

export const progressService = {
  /**
   * Get learning progress with charts data
   */
  async getProgress(filter?: ProgressFilter): Promise<WeeklyProgressResponse> {
    const params: Record<string, any> = {}
    
    if (filter?.filter_week !== undefined) {
      params.filter_week = filter.filter_week
    }
    
    if (filter?.week_offset !== undefined) {
      params.week_offset = filter.week_offset
    }
    
    if (filter?.start_date) {
      params.start_date = filter.start_date
    }
    
    if (filter?.end_date) {
      params.end_date = filter.end_date
    }
    
    if (filter?.session_type) {
      params.session_type = filter.session_type
    }

    const response = await apiClient.get<WeeklyProgressResponse>(BASE_URL, {
      params,
    })
    return response.data
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ProgressSummary> {
    const response = await apiClient.get<ProgressSummary>(
      `${BASE_URL}/dashboard`
    )
    return response.data
  },

  /**
   * Get progress summary only (without detailed charts data)
   */
  async getProgressSummary(filterWeek = false): Promise<ProgressSummary> {
    const response = await apiClient.get<ProgressSummary>(
      `${BASE_URL}/summary`,
      {
        params: { filter_week: filterWeek },
      }
    )
    return response.data
  },
}

