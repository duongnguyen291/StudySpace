/**
 * Pomodoro Service
 * API calls for Pomodoro feature
 */
import { apiClient } from '@/shared/utils/api'
import type { PomodoroSession, PomodoroSessionCreate, PomodoroStats } from '../types/pomodoro.types'

const BASE_URL = '/pomodoro'

export const pomodoroService = {
  async createSession(data: PomodoroSessionCreate): Promise<PomodoroSession> {
    const response = await apiClient.post(`${BASE_URL}/sessions`, data)
    return response.data
  },

  async getSessions(skip = 0, limit = 100): Promise<{ total: number; sessions: PomodoroSession[] }> {
    const response = await apiClient.get(`${BASE_URL}/sessions`, {
      params: { skip, limit }
    })
    return response.data
  },

  async getSession(sessionId: string): Promise<PomodoroSession> {
    const response = await apiClient.get(`${BASE_URL}/sessions/${sessionId}`)
    return response.data
  },

  async completeSession(sessionId: string): Promise<PomodoroSession> {
    const response = await apiClient.patch(`${BASE_URL}/sessions/${sessionId}/complete`)
    return response.data
  },

  async getTodayStats(): Promise<PomodoroStats> {
    const response = await apiClient.get(`${BASE_URL}/stats/today`)
    return response.data
  }
}

