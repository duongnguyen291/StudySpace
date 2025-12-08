'use client'
import React, { useState, useEffect } from 'react'
import type { QuizAttempt, QuizAttemptDetailWithAnswers } from '../types/quiz.types'
import { getAttemptDetail, getUserAttempts } from '../services/quizService'

interface Props {
  quizSetId?: string
  limit?: number
}

export default function QuizHistory({ quizSetId, limit = 10 }: Props): JSX.Element {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<QuizAttemptDetailWithAnswers | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

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

  const loadDetail = async (attemptId: string) => {
    setLoadingDetail(true)
    try {
      const detail = await getAttemptDetail(attemptId)
      setSelected(detail)
    } catch {
      setSelected(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  const scores = attempts.map((a) => a.score ?? 0)
  const maxScore = Math.max(100, ...scores)
  const points = scores
    .map((s, idx) => {
      const x = (idx / Math.max(1, scores.length - 1)) * 100
      const y = 100 - (s / maxScore) * 100
      return `${x},${y}`
    })
    .join(' ')

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
    <div className="space-y-4">
      {/* Trend chart */}
      <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm text-slate-300 font-semibold">Recent performance</h4>
          <span className="text-xs text-slate-400">Attempts: {attempts.length}</span>
        </div>
        <div className="h-28">
          {scores.length >= 2 ? (
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={points}
              />
              {scores.map((s, idx) => {
                const x = (idx / Math.max(1, scores.length - 1)) * 100
                const y = 100 - (s / maxScore) * 100
                return (
                  <circle key={idx} cx={x} cy={y} r="1.8" fill="currentColor" />
                )
              })}
            </svg>
          ) : (
            <div className="text-slate-500 text-sm">Complete at least two attempts to view trend.</div>
          )}
        </div>
      </div>

      {/* Attempts list */}
      <div className="space-y-3">
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
          className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:border-slate-600 transition"
          onClick={() => loadDetail(attempt.id)}
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
            <p className="text-slate-300 text-sm truncate">
              {attempt.quiz_set_title || 'Quiz'}
            </p>
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

      {/* Detail drawer */}
      {selected && (
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/70">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-slate-300 font-semibold">{selected.quiz_set_title || 'Quiz attempt'}</p>
              <p className="text-slate-500 text-sm">
                {selected.correct_answers}/{selected.total_questions} correct · {formatTime(selected.time_spent_seconds)}
              </p>
            </div>
            <button
              className="text-slate-400 hover:text-white text-sm"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
          {loadingDetail ? (
            <div className="text-slate-500 text-sm">Loading details...</div>
          ) : (
            <div className="space-y-3">
              {selected.questions.map((q) => (
                <div
                  key={q.question_id}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-800/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-slate-200 text-sm">{q.question_text}</p>
                    <span className={`text-xs font-medium ${q.is_correct ? 'text-emerald-400' : 'text-red-400'}`}>
                      {q.is_correct ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                  {!q.is_correct && (
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Your answer: <span className="text-white">{q.user_answer ?? '—'}</span></p>
                      <p>Correct answer: <span className="text-emerald-300">{q.correct_answer}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

