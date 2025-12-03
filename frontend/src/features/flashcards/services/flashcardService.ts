import { apiClient } from '@/shared/utils/api'
import type {
  FlashcardDeck,
  FlashcardDeckDetail,
  FlashcardDeckCreate,
  Flashcard,
  CSVImportResult,
  CSVPreviewResponse
} from '../types/flashcard.types'

// ============================================
// Deck API
// ============================================

export async function getDecks(): Promise<FlashcardDeck[]> {
  const res = await apiClient.get('/flashcards/decks')
  return res.data
}

export async function getDeck(deckId: string): Promise<FlashcardDeckDetail> {
  const res = await apiClient.get(`/flashcards/decks/${deckId}`)
  return res.data
}

export async function createDeck(data: FlashcardDeckCreate): Promise<FlashcardDeck> {
  const res = await apiClient.post('/flashcards/decks', data)
  return res.data
}

export async function deleteDeck(deckId: string): Promise<void> {
  await apiClient.delete(`/flashcards/decks/${deckId}`)
}

// ============================================
// Review with Shuffle
// ============================================

export async function getCardsForReview(deckId: string, shuffle = false): Promise<Flashcard[]> {
  const res = await apiClient.get(`/flashcards/decks/${deckId}/review`, {
    params: { shuffle }
  })
  return res.data
}

// ============================================
// CSV Import/Export
// ============================================

export async function downloadTemplate(): Promise<Blob> {
  const res = await apiClient.get('/flashcards/template', { responseType: 'blob' })
  return res.data
}

export async function previewCsv(file: File): Promise<CSVPreviewResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await apiClient.post('/flashcards/preview', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function importCsv(file: File, title: string, description?: string): Promise<CSVImportResult> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('title', title)
  if (description) fd.append('description', description)
  
  const res = await apiClient.post('/flashcards/import', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function exportCsv(deckId: string): Promise<Blob> {
  const res = await apiClient.get(`/flashcards/decks/${deckId}/export`, {
    responseType: 'blob'
  })
  return res.data
}

// ============================================
// Helpers
// ============================================

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

