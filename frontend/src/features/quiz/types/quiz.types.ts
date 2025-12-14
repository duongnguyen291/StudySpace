// ============================================
// Quiz Types: Multiple Choice (1 question + 4 options)
// ============================================

// Question Types
export interface QuizQuestion {
  id: string
  quiz_set_id: string
  question_text: string
  options: string[]  // Exactly 4 options
  correct_answer_index: number  // 0-3
  explanation?: string | null
  order_index: number
  created_at: string
}

export interface QuizQuestionCreate {
  question_text: string
  options: string[]  // Exactly 4 options
  correct_answer_index: number  // 0-3
  explanation?: string | null
}

export interface QuizQuestionForAttempt {
  id: string
  question_text: string
  options: string[]  // Exactly 4 options
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

export interface QuizSetUpdate {
  title?: string
  description?: string | null
  is_public?: boolean
}

// Attempt Types
export interface QuizAttempt {
  id: string
  user_id: string
  quiz_set_id: string
  quiz_set_title?: string | null
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
  selected_option_index: number  // 0-3
}

export interface QuizAttemptSubmit {
  answers: QuizAttemptAnswer[]
  time_spent_seconds?: number | null
}

export interface QuizAttemptDetail extends QuizAttempt {
  questions: QuizQuestionForAttempt[]
}

export interface QuizAttemptResult extends QuizAttempt {
  answers?: Record<string, number> | null  // question_id -> selected_option_index
}

export interface QuizAttemptQuestionDetail {
  question_id: string
  question_text: string
  options: string[]
  correct_answer_index: number
  selected_option_index?: number | null
  is_correct: boolean
  explanation?: string | null
}

export interface QuizAttemptDetailWithAnswers extends QuizAttempt {
  quiz_set_title?: string | null
  questions: QuizAttemptQuestionDetail[]
}

// CSV Types (for future use)
export interface CSVImportError {
  line: number
  message: string
}

export interface CSVPreviewRow {
  line: number
  question: string
  options: string[]
  correct_index: number
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

// Component Props
export type QuizPlayerProps = {
  quizSetId: string
  quizTitle: string
  onComplete?: (result: QuizAttemptResult) => void
  onCancel?: () => void
}
