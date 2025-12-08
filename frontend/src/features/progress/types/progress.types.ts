/**
 * Progress Tracker Feature Types
 */

export interface DailyProgress {
  date: string
  total_minutes: number
  total_quizzes: number
  completed_sessions: number
}

export interface SessionTypeStats {
  session_type: string
  total_minutes: number
  session_count: number
  percentage: number
}

export interface ProgressSummary {
  total_minutes: number
  total_quizzes: number
  total_sessions: number
  week_minutes: number
  week_quizzes: number
  week_sessions: number
  average_daily_minutes: number
  average_daily_quizzes: number
}

export interface WeeklyProgressResponse {
  summary: ProgressSummary
  daily_progress: DailyProgress[]
  session_type_stats: SessionTypeStats[]
  week_start: string
  week_end: string
}

export interface ProgressFilter {
  filter_week?: boolean
  week_offset?: number
  start_date?: string
  end_date?: string
  session_type?: string
}

