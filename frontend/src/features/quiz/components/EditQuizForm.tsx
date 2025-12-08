'use client'
import React, { useState, useEffect } from 'react'
import type { QuizSetDetail, QuizSetUpdate, QuizQuestion, QuizQuestionCreate } from '@/features/quiz/types/quiz.types'
import { 
  getQuizSet, 
  updateQuizSet, 
  addQuestion, 
  updateQuestion, 
  deleteQuestion 
} from '@/features/quiz/services/quizService'

interface Props {
  quizSetId: string
  onBack: () => void
  onSave: () => void
}

export default function EditQuizForm({ quizSetId, onBack, onSave }: Props) {
  const [quizSet, setQuizSet] = useState<QuizSetDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState<QuizQuestionCreate>({ question_text: '', correct_answer: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    loadQuizSet()
  }, [quizSetId])

  const loadQuizSet = async () => {
    setIsLoading(true)
    try {
      const data = await getQuizSet(quizSetId)
      setQuizSet(data)
      setTitle(data.title)
      setDescription(data.description || '')
      setIsPublic(data.is_public)
    } catch (err) {
      console.error('Failed to load quiz set:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveQuizSet = async () => {
    if (!quizSet) return
    
    setIsSaving(true)
    try {
      const updateData: QuizSetUpdate = {
        title: title.trim(),
        description: description.trim() || null,
        is_public: isPublic
      }
      await updateQuizSet(quizSet.id, updateData)
      await loadQuizSet()
      onSave()
    } catch (err) {
      console.error('Failed to update quiz set:', err)
      alert('Failed to save quiz set')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text.trim() || !newQuestion.correct_answer.trim()) {
      alert('Please fill in both question and answer')
      return
    }

    try {
      await addQuestion(quizSetId, newQuestion)
      setNewQuestion({ question_text: '', correct_answer: '' })
      setShowAddForm(false)
      await loadQuizSet()
    } catch (err) {
      console.error('Failed to add question:', err)
      alert('Failed to add question')
    }
  }

  const handleUpdateQuestion = async (questionId: string, data: QuizQuestionCreate) => {
    try {
      await updateQuestion(questionId, data)
      setEditingQuestionId(null)
      await loadQuizSet()
    } catch (err) {
      console.error('Failed to update question:', err)
      alert('Failed to update question')
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    try {
      await deleteQuestion(questionId)
      await loadQuizSet()
    } catch (err) {
      console.error('Failed to delete question:', err)
      alert('Failed to delete question')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <div className="text-center text-slate-400">Loading...</div>
        </div>
      </div>
    )
  }

  if (!quizSet) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <div className="text-center text-red-400">Quiz not found</div>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg"
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Quiz</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition"
          >
            ← Back
          </button>
        </div>

        {/* Quiz Set Info Form */}
        <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quiz Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Quiz title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Quiz description (optional)"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
              />
              <label htmlFor="isPublic" className="text-sm text-slate-300">
                Make this quiz public
              </label>
            </div>

            <button
              onClick={handleSaveQuizSet}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Quiz Info'}
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-slate-900/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Questions ({quizSet.questions.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium"
            >
              {showAddForm ? 'Cancel' : '+ Add Question'}
            </button>
          </div>

          {/* Add Question Form */}
          {showAddForm && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">New Question</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Question"
                />
                <input
                  type="text"
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Correct Answer"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewQuestion({ question_text: '', correct_answer: '' })
                    }}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-3">
            {quizSet.questions.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                No questions yet. Add your first question!
              </div>
            ) : (
              quizSet.questions
                .sort((a, b) => a.order_index - b.order_index)
                .map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    isEditing={editingQuestionId === question.id}
                    onEdit={() => setEditingQuestionId(question.id)}
                    onCancel={() => setEditingQuestionId(null)}
                    onUpdate={handleUpdateQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface QuestionItemProps {
  question: QuizQuestion
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdate: (id: string, data: QuizQuestionCreate) => void
  onDelete: (id: string) => void
}

function QuestionItem({ question, isEditing, onEdit, onCancel, onUpdate, onDelete }: QuestionItemProps) {
  const [questionText, setQuestionText] = useState(question.question_text)
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer)

  useEffect(() => {
    if (isEditing) {
      setQuestionText(question.question_text)
      setCorrectAnswer(question.correct_answer)
    }
  }, [isEditing, question])

  const handleSave = () => {
    if (!questionText.trim() || !correctAnswer.trim()) {
      alert('Please fill in both question and answer')
      return
    }
    onUpdate(question.id, {
      question_text: questionText.trim(),
      correct_answer: correctAnswer.trim()
    })
  }

  if (isEditing) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/50">
        <div className="space-y-3">
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Question"
          />
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Correct Answer"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-white font-medium mb-2">{question.question_text}</div>
          <div className="text-sm text-slate-400">
            <span className="text-slate-500">Answer: </span>
            <span className="text-emerald-400">{question.correct_answer}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition text-sm"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-2 bg-slate-700 text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

