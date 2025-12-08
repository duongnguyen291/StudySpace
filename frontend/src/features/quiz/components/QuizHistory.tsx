'use client'
import React, { useState, useEffect } from 'react'
import type { QuizAttempt } from '../types/quiz.types'
import { getUserAttempts } from '../services/quizService'

interface Props {
  quizSetId?: string
  limit?: number
}

export default function QuizHistory({ quizSetId, limit = 10 }: Props): JSX.Element {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAttempts()
  }, [quizSetId])

  const loadAttempts = async () => {
    setIsLoading(true)
    try {
      const data = await getUserAttempts(quizSetId, 0, limit)
      setAttempts(data)
    } catch {
      // Handle silently
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds: number | null | undefined) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return 'text-slate-400'
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-slate-400">No quiz attempts yet</p>
        <p className="text-slate-500 text-sm mt-1">Complete a quiz to see your history</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
          className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
        >
          {/* Score Circle */}
          <div className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${
            (attempt.score || 0) >= 70 ? 'bg-emerald-500/20' : 'bg-orange-500/20'
          }`}>
            <span className={`text-lg font-bold ${getScoreColor(attempt.score)}`}>
              {attempt.score?.toFixed(0) || 0}%
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                {attempt.correct_answers}/{attempt.total_questions} correct
              </span>
              {attempt.completed_at && (
                <span className="text-emerald-400 text-xs">✓ Completed</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span>⏱️ {formatTime(attempt.time_spent_seconds)}</span>
              <span>📅 {formatDate(attempt.created_at)}</span>
            </div>
          </div>

          {/* Score Badge */}
          <div className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium ${
            (attempt.score || 0) >= 80 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : (attempt.score || 0) >= 60 
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {(attempt.score || 0) >= 80 ? 'Excellent' : (attempt.score || 0) >= 60 ? 'Good' : 'Practice'}
          </div>
        </div>
      ))}
    </div>
  )
}

