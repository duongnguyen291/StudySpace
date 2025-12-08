/**
 * Flashcard Types
 * TypeScript types for flashcard management
 */

export interface FlashcardDeck {
  id: string
  user_id: string
  category_id?: string | null
  title: string
  description?: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  flashcard_count?: number
}

export interface Flashcard {
  id: string
  deck_id: string
  question: string
  answer: string
  hint?: string | null
  order_index: number
  created_at: string
  updated_at: string
  progress?: FlashcardProgress | null
}

export interface FlashcardProgress {
  id: string
  user_id: string
  flashcard_id: string
  confidence_level: number // 0-5
  last_reviewed?: string | null
  next_review?: string | null
  review_count: number
  created_at: string
  updated_at: string
}

export interface FlashcardDeckCreate {
  title: string
  description?: string
  category_id?: string
  is_public?: boolean
}

export interface FlashcardDeckUpdate {
  title?: string
  description?: string
  category_id?: string
  is_public?: boolean
}

export interface FlashcardCreate {
  question: string
  answer: string
  hint?: string
  order_index?: number
}

export interface FlashcardUpdate {
  question?: string
  answer?: string
  hint?: string
  order_index?: number
}

export interface FlashcardDeckListResponse {
  decks: FlashcardDeck[]
  total: number
  page: number
  page_size: number
  has_next: boolean
  has_prev: boolean
}

export interface FlashcardListResponse {
  flashcards: Flashcard[]
  total: number
  deck_id: string
}

// CSV import/preview
export interface FlashcardCSVImportError {
  line: number
  message: string
}

export interface FlashcardCSVPreviewRow {
  line: number
  question: string
  answer: string
  is_valid: boolean
  error?: string | null
}

export interface FlashcardCSVPreviewResponse {
  headers: string[]
  rows: FlashcardCSVPreviewRow[]
  total_rows: number
  valid_rows: number
  errors: FlashcardCSVImportError[]
}

export interface FlashcardCSVImportResult {
  success: boolean
  flashcards_imported: number
  errors: FlashcardCSVImportError[]
}

export interface FlashcardDeckFilter {
  category_id?: string
  search?: string
  is_public?: boolean
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// Review Session Types
export type ReviewMode = 'random' | 'spaced'

export interface ReviewSessionStart {
  deck_id: string
  mode?: ReviewMode
  limit?: number
}

export interface ReviewCard {
  flashcard: Flashcard
  progress?: FlashcardProgress | null
  is_new: boolean
}

export interface ReviewSessionResponse {
  session_id: string
  deck_id: string
  cards: ReviewCard[]
  total_cards: number
  new_cards: number
  due_cards: number
  mode: string
}

export interface ReviewResult {
  flashcard_id: string
  confidence_level: number // 0-5
}

export interface ReviewSessionComplete {
  session_id: string
  results: ReviewResult[]
}

