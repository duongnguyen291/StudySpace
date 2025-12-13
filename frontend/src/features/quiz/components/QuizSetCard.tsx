'use client'
import React from 'react'
import type { QuizSet } from '../types/quiz.types'

interface Props {
  quizSet: QuizSet
  onPlay: () => void
  onEdit: () => void
  onExport: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export default function QuizSetCard({ 
  quizSet, 
  onPlay, 
  onEdit, 
  onExport, 
  onDelete,
  isDeleting 
}: Props): JSX.Element {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
              {quizSet.title}
            </h3>
            {quizSet.description && (
              <p className="text-slate-400 text-sm mt-1.5 line-clamp-2">
                {quizSet.description}
              </p>
            )}
          </div>
          {quizSet.is_public && (
            <span className="shrink-0 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
              Public
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-emerald-400">📋</span>
            <span className="text-slate-300">{quizSet.question_count}</span>
            <span className="text-slate-500">questions</span>
          </div>
          <div className="text-slate-600">•</div>
          <div className="text-xs text-slate-500">
            {formatDate(quizSet.created_at)}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/50 flex items-center gap-2">
        <button
          onClick={onPlay}
          disabled={quizSet.question_count === 0}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
        >
          ▶ Bắt đầu Quiz
        </button>
        
        <button
          onClick={onEdit}
          className="p-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition"
          title="Sửa"
        >
          ✏️
        </button>
        
        <button
          onClick={onExport}
          className="p-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition"
          title="Xuất CSV"
        >
          📤
        </button>
        
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-2.5 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition disabled:opacity-50"
          title="Xóa"
        >
          {isDeleting ? '⏳' : '🗑️'}
        </button>
      </div>
    </div>
  )
}

