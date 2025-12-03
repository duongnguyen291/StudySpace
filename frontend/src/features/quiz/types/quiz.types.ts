// ============================================
// Simple Quiz Types: just question and answer
// ============================================

// Question Types
export interface QuizQuestion {
  id: string
  quiz_set_id: string
  question_text: string
  correct_answer: string
  order_index: number
  created_at: string
}

export interface QuizQuestionCreate {
  question_text: string
  correct_answer: string
}

export interface QuizQuestionForAttempt {
  id: string
  question_text: string
  question_type: string
  options?: string[] | null
  order_index: number
}

// Quiz Set Types
export interface QuizSet {
  id: string
  user_id: string
  category_id?: string | null
  title: string
  description?: string | null
  is_public: boolean
  question_count: number
  created_at: string
  updated_at: string
}

export interface QuizSetDetail extends QuizSet {
  questions: QuizQuestion[]
}

export interface QuizSetCreate {
  title: string
  description?: string | null
  category_id?: string | null
  is_public?: boolean
  questions?: QuizQuestionCreate[]
}

// Attempt Types
export interface QuizAttempt {
  id: string
  user_id: string
  quiz_set_id: string
  score?: number | null
  total_questions: number
  correct_answers: number
  time_spent_seconds?: number | null
  completed_at?: string | null
  created_at: string
}

export interface QuizAttemptCreate {
  quiz_set_id: string
}

export interface QuizAttemptAnswer {
  question_id: string
  user_answer: string
}

export interface QuizAttemptSubmit {
  answers: QuizAttemptAnswer[]
  time_spent_seconds?: number | null
}

export interface QuizAttemptDetail extends QuizAttempt {
  questions: QuizQuestionForAttempt[]
}

export interface QuizAttemptResult extends QuizAttempt {
  answers?: Record<string, string> | null
}

// CSV Types
export interface CSVImportError {
  line: number
  message: string
}

export interface CSVPreviewRow {
  line: number
  question: string
  answer: string
  is_valid: boolean
  error?: string | null
}

export interface CSVPreviewResponse {
  headers: string[]
  rows: CSVPreviewRow[]
  total_rows: number
  valid_rows: number
  errors: CSVImportError[]
}

export interface CSVImportResult {
  success: boolean
  quiz_set_id?: string | null
  questions_imported: number
  errors: CSVImportError[]
}

// Legacy exports for compatibility
export type Row = string[]
export type ParsedResult = {
  headers: string[]
  rows: Row[]
  errors?: CSVImportError[]
}
export type QuestionType = 'short_answer'
export type QuizQuestionUpdate = Partial<QuizQuestionCreate>
export type QuizSetUpdate = Partial<QuizSetCreate>
export type QuizPlayerProps = {
  quizSetId: string
  quizTitle: string
  onComplete?: (result: QuizAttemptResult) => void
  onCancel?: () => void
}
