/**
 * Global constants
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  POMODORO: {
    SESSIONS: '/pomodoro/sessions',
    STATS: '/pomodoro/stats/today',
  },
  NOTES: {
    BASE: '/notes',
  },
} as const

export const APP_NAME = 'StudySpace'
export const APP_VERSION = '1.0.0'

