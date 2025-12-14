'use client'
import React, { useState, useEffect } from 'react'
import type { QuizSet } from '../types/quiz.types'
import { getQuizSets, deleteQuizSet } from '../services/quizService'

interface Props {
  onSelectQuiz: (quizSet: QuizSet) => void
  onCreateNew: () => void
  refreshTrigger?: number
}

export default function QuizSetList({ onSelectQuiz, onCreateNew, refreshTrigger }: Props): JSX.Element {
  const [quizSets, setQuizSets] = useState<QuizSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadQuizSets = async () => {
    setIsLoading(true)
    try {
      const sets = await getQuizSets()
      setQuizSets(sets)
    } catch {
      // Handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuizSets()
  }, [refreshTrigger])

  const handleDelete = async (e: React.MouseEvent, quizSetId: string) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this quiz set?')) return

    setDeletingId(quizSetId)
    try {
      await deleteQuizSet(quizSetId)
      setQuizSets(prev => prev.filter(q => q.id !== quizSetId))
    } catch {
      // Handle error
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-4" />
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
            <div className="h-4 bg-slate-700 rounded w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">My Quiz Sets</h2>
          <p className="text-slate-400 mt-1">Select a quiz to practice or create a new one</p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
        >
          ➕ New Quiz
        </button>
      </div>

      {quizSets.length === 0 ? (
        <div className="bg-slate-800/30 rounded-2xl border border-dashed border-slate-600 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-700/50 flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Quiz Sets Yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Create your first quiz set by importing questions from a CSV file or adding them manually.
          </p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizSets.map(set => (
            <div
              key={set.id}
              onClick={() => onSelectQuiz(set)}
              className="group bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/70 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition line-clamp-1">
                    {set.title}
                  </h3>
                  {set.description && (
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{set.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(e, set.id)}
                  disabled={deletingId === set.id}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Xóa bộ quiz"
                >
                  {deletingId === set.id ? '⏳' : '🗑️'}
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span>📋</span>
                  <span>{set.question_count} questions</span>
                </div>
                {set.is_public && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                    Public
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                <span>Created {formatDate(set.created_at)}</span>
                <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                  Start Quiz →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

