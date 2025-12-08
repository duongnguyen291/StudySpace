/**
 * Pomodoro Feature Types
 */

export type SessionType = 'work' | 'short_break' | 'long_break'

export interface PomodoroSession {
  id: string
  user_id: string
  session_type: SessionType
  duration_minutes: number
  started_at: string
  completed_at: string | null
  is_completed: boolean
  notes: string | null
}

export interface PomodoroSessionCreate {
  session_type: SessionType
  duration_minutes: number
  notes?: string
}

export interface PomodoroStats {
  date: string
  total_sessions: number
  completed_sessions: number
  total_minutes: number
}

