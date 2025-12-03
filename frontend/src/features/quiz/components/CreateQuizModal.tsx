'use client'
import React, { useState } from 'react'
import type { QuizSetCreate, QuizQuestionCreate } from '../types/quiz.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QuizSetCreate) => Promise<void>
  isLoading?: boolean
}

export default function CreateQuizModal({ isOpen, onClose, onSubmit, isLoading }: Props): JSX.Element | null {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<QuizQuestionCreate[]>([])
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  
  // New question form state
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')

  if (!isOpen) return null

  const handleAddQuestion = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return

    setQuestions([...questions, {
      question_text: newQuestion.trim(),
      correct_answer: newAnswer.trim(),
    }])

    // Reset form
    setNewQuestion('')
    setNewAnswer('')
    setShowAddQuestion(false)
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      questions: questions.length > 0 ? questions : undefined
    })

    // Reset all
    setTitle('')
    setDescription('')
    setQuestions([])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-800 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Create New Quiz</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition resize-none"
            />
          </div>

          {/* Questions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">
                Questions ({questions.length})
              </label>
              <button
                type="button"
                onClick={() => setShowAddQuestion(true)}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition"
              >
                + Add Question
              </button>
            </div>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="space-y-2 mb-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{q.question_text}</p>
                      <p className="text-slate-500 text-xs mt-0.5">→ {q.correct_answer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="shrink-0 p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Question Form */}
            {showAddQuestion && (
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-600 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">New Question</span>
                  <button
                    type="button"
                    onClick={() => setShowAddQuestion(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Question..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-emerald-500 outline-none"
                />

                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Answer..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-emerald-500 outline-none"
                />

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                  className="w-full py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  Add Question
                </button>
              </div>
            )}

            {questions.length === 0 && !showAddQuestion && (
              <p className="text-sm text-slate-500 italic">
                No questions added yet. You can add them now or import from CSV later.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? '⏳ Creating...' : '✓ Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
