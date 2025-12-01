import { useState } from 'react'
import type { ParsedResult } from '../types/quiz.types'
import { uploadCsv } from '../services/quizService'

export function useQuiz() {
  const [loading, setLoading] = useState(false)
  async function sendFile(file: File): Promise<ParsedResult | null> {
    setLoading(true)
    try {
      const data = await uploadCsv(file)
      return data as ParsedResult
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }
  return { loading, sendFile }
}