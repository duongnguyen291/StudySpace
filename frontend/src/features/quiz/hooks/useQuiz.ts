import { useState, useCallback } from 'react'
import type { 
  QuizSet, 
  QuizSetDetail, 
  QuizAttempt, 
  QuizAttemptResult,
  CSVImportResult 
} from '../types/quiz.types'
import * as quizService from '../services/quizService'

export function useQuiz() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'An error occurred'
    setError(message)
    return null
  }

  // Quiz Set operations
  const fetchQuizSets = useCallback(async (): Promise<QuizSet[] | null> => {
    setLoading(true)
    setError(null)
    try {
      const sets = await quizService.getQuizSets()
      return sets
    } catch (err) {
      return handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchQuizSet = useCallback(async (id: string): Promise<QuizSetDetail | null> => {
    setLoading(true)
    setError(null)
    try {
      const set = await quizService.getQuizSet(id)
      return set
    } catch (err) {
      return handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createQuizSet = useCallback(async (data: Parameters<typeof quizService.createQuizSet>[0]): Promise<QuizSet | null> => {
    setLoading(true)
    setError(null)
    try {
      const set = await quizService.createQuizSet(data)
      return set
    } catch (err) {
      return handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const removeQuizSet = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await quizService.deleteQuizSet(id)
      return true
    } catch (err) {
      handleError(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // CSV Import/Export
  const importFromCsv = useCallback(async (
    file: File,
    title: string,
    description?: string
  ): Promise<CSVImportResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await quizService.importCsv(file, title, description)
      return result
    } catch (err) {
      return handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const exportToCsv = useCallback(async (quizSetId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const blob = await quizService.exportCsv(quizSetId)
      quizService.downloadBlob(blob, 'quiz_export.csv')
      return true
    } catch (err) {
      handleError(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Quiz Attempt operations
  const startQuizAttempt = useCallback(async (quizSetId: string) => {
    setLoading(true)
    setError(null)
    try {
      const attempt = await quizService.startAttempt({ quiz_set_id: quizSetId })
      return attempt
    } catch (err) {
      return handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const submitQuizAttempt = useCallback(async (
    attemptId: string,
    answers: { question_id: string; selected_option_index: number }[],
    timeSpentSeconds?: number
  ): Promise<QuizAttemptResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await quizService.submitAttempt(attemptId, {
        answers,
        time_spent_seconds: timeSpentSeconds
      })
      return result
    } catch (err) {
      return handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserAttempts = useCallback(async (quizSetId?: string): Promise<QuizAttempt[] | null> => {
    setLoading(true)
    setError(null)
    try {
      const attempts = await quizService.getUserAttempts(quizSetId)
      return attempts
    } catch (err) {
      return handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    loading,
    error,
    clearError,
    // Quiz Sets
    fetchQuizSets,
    fetchQuizSet,
    createQuizSet,
    removeQuizSet,
    // CSV
    importFromCsv,
    exportToCsv,
    // Attempts
    startQuizAttempt,
    submitQuizAttempt,
    fetchUserAttempts
  }
}
