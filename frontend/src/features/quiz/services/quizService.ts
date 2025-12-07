import { apiClient } from '@/shared/utils/api'
import type {
  QuizSet,
  QuizSetDetail,
  QuizSetCreate,
  QuizSetUpdate,
  QuizQuestion,
  QuizQuestionCreate,
  QuizQuestionUpdate,
  QuizAttempt,
  QuizAttemptCreate,
  QuizAttemptDetail,
  QuizAttemptSubmit,
  QuizAttemptResult,
  CSVImportResult,
  CSVPreviewResponse,
  QuizQuestionForAttempt
} from '../types/quiz.types'

// ============================================
// Quiz Set API
// ============================================

export async function getQuizSets(skip = 0, limit = 100): Promise<QuizSet[]> {
  const res = await apiClient.get('/quiz/sets', { params: { skip, limit } })
  return res.data
}

export async function getQuizSet(quizSetId: string): Promise<QuizSetDetail> {
  const res = await apiClient.get(`/quiz/sets/${quizSetId}`)
  return res.data
}

export async function createQuizSet(data: QuizSetCreate): Promise<QuizSet> {
  const res = await apiClient.post('/quiz/sets', data)
  return res.data
}

export async function updateQuizSet(quizSetId: string, data: QuizSetUpdate): Promise<QuizSet> {
  const res = await apiClient.put(`/quiz/sets/${quizSetId}`, data)
  return res.data
}

export async function deleteQuizSet(quizSetId: string): Promise<void> {
  await apiClient.delete(`/quiz/sets/${quizSetId}`)
}

// ============================================
// Quiz Question API
// ============================================

export async function addQuestion(quizSetId: string, data: QuizQuestionCreate): Promise<QuizQuestion> {
  const res = await apiClient.post(`/quiz/sets/${quizSetId}/questions`, data)
  return res.data
}

export async function updateQuestion(questionId: string, data: QuizQuestionCreate): Promise<QuizQuestion> {
  const res = await apiClient.put(`/quiz/questions/${questionId}`, data)
  return res.data
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await apiClient.delete(`/quiz/questions/${questionId}`)
}

// ============================================
// CSV Import/Export API
// ============================================

export async function downloadTemplate(): Promise<Blob> {
  const res = await apiClient.get('/quiz/template', { responseType: 'blob' })
  return res.data
}

export async function previewCsv(file: File, limit = 10): Promise<CSVPreviewResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await apiClient.post('/quiz/preview', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { limit }
  })
  return res.data
}

export async function importCsv(file: File, title: string, description?: string): Promise<CSVImportResult> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('title', title)
  if (description) {
    fd.append('description', description)
  }
  const res = await apiClient.post('/quiz/import', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function exportCsv(quizSetId: string, includeExplanations = true): Promise<Blob> {
  const res = await apiClient.get(`/quiz/sets/${quizSetId}/export`, {
    params: { include_explanations: includeExplanations },
    responseType: 'blob'
  })
  return res.data
}

// ============================================
// Quiz Attempt API
// ============================================

export async function startAttempt(data: QuizAttemptCreate): Promise<QuizAttemptDetail> {
  const res = await apiClient.post('/quiz/attempts', data)
  return res.data
}

export async function submitAttempt(attemptId: string, data: QuizAttemptSubmit): Promise<QuizAttemptResult> {
  const res = await apiClient.post(`/quiz/attempts/${attemptId}/submit`, data)
  return res.data
}

export async function getUserAttempts(quizSetId?: string, skip = 0, limit = 50): Promise<QuizAttempt[]> {
  const res = await apiClient.get('/quiz/attempts', {
    params: { quiz_set_id: quizSetId, skip, limit }
  })
  return res.data
}

// ============================================
// Helper Functions
// ============================================

export function parseCSVSimple(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split(/\r?\n/)
  
  for (const line of lines) {
    if (line === '') {
      rows.push([])
      continue
    }
    let cur = ''
    let inQuotes = false
    const row: string[] = []
    
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    row.push(cur.trim())
    rows.push(row)
  }
  return rows
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================
// Shuffle Helper (client-side only)
// ============================================

export function shuffleQuestions<T>(questions: T[]): T[] {
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
