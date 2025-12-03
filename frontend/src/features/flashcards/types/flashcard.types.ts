// ============================================
// Flashcard Types
// ============================================

export interface Flashcard {
  id: string
  deck_id: string
  question: string
  answer: string
  hint?: string | null
  order_index: number
  created_at: string
}

export interface FlashcardCreate {
  question: string
  answer: string
  hint?: string | null
}

// ============================================
// Deck Types
// ============================================

export interface FlashcardDeck {
  id: string
  user_id: string
  title: string
  description?: string | null
  is_public: boolean
  card_count: number
  created_at: string
  updated_at: string
}

export interface FlashcardDeckDetail extends FlashcardDeck {
  flashcards: Flashcard[]
}

export interface FlashcardDeckCreate {
  title: string
  description?: string | null
  is_public?: boolean
  flashcards?: FlashcardCreate[]
}

// ============================================
// CSV Types
// ============================================

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
  deck_id?: string | null
  cards_imported: number
  errors: CSVImportError[]
}

