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
  TASKS: {
    BASE: '/tasks',
    STATS: '/tasks/stats',
    TOGGLE: (id: string) => `/tasks/${id}/toggle`,
    BY_ID: (id: string) => `/tasks/${id}`,
    BULK_DELETE: '/tasks/bulk/delete',
    BULK_COMPLETE: '/tasks/bulk/complete',
    BULK_UNCOMPLETE: '/tasks/bulk/uncomplete',
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },
  FLASHCARDS: {
    DECKS: '/flashcards/decks',
    DECK_BY_ID: (id: string) => `/flashcards/decks/${id}`,
    DECK_FLASHCARDS: (deckId: string) => `/flashcards/decks/${deckId}/flashcards`,
    DECK_FLASHCARDS_BULK: (deckId: string) => `/flashcards/decks/${deckId}/flashcards/bulk`,
    FLASHCARD_BY_ID: (id: string) => `/flashcards/flashcards/${id}`,
    REVIEW_START: '/flashcards/review/start',
    REVIEW_SUBMIT: '/flashcards/review/submit',
  },
} as const

export const APP_NAME = 'StudySpace'
export const APP_VERSION = '1.0.0'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export const API_VERSION = '/api/v1'

