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
  const [showAddForm, setShowAddForm] = useState(false)

  // New question form state
  const [newQuestion, setNewQuestion] = useState('')
  const [newOptions, setNewOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState<number>(0)
  const [explanation, setExplanation] = useState('')

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
      // Show error to user
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quiz'
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        // Quiz might not exist or user doesn't have access
        alert('Quiz not found. It may have been deleted or you may not have permission to view it.')
      } else {
        alert(`Error loading quiz: ${errorMessage}`)
      }
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
    if (!newQuestion.trim() || newOptions.some(opt => !opt.trim())) {
      alert('Please fill in the question and all 4 options')
      return
    }

    try {
      await addQuestion(quizSetId, {
        question_text: newQuestion.trim(),
        options: newOptions.map(opt => opt.trim()),
        correct_answer_index: correctIndex,
        explanation: explanation.trim() || undefined,
      })
      setNewQuestion('')
      setNewOptions(['', '', '', ''])
      setCorrectIndex(0)
      setExplanation('')
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

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...newOptions]
    updated[index] = value
    setNewOptions(updated)
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
              {isSaving ? 'Đang lưu...' : 'Lưu thông tin Quiz'}
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
              {showAddForm ? 'Hủy' : '+ Thêm câu hỏi'}
            </button>
          </div>

          {/* Add Question Form */}
          {showAddForm && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Câu hỏi mới</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Câu hỏi"
                />
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Tùy chọn (cần 4) *</label>
                  <div className="space-y-2">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={correctIndex === idx}
                          onChange={() => setCorrectIndex(idx)}
                          className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-600 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Tùy chọn ${String.fromCharCode(65 + idx)}...`}
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Chọn nút radio bên cạnh câu trả lời đúng</p>
                </div>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Giải thích (tùy chọn)"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium"
                  >
                    Thêm
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewQuestion('')
                      setNewOptions(['', '', '', ''])
                      setCorrectIndex(0)
                      setExplanation('')
                    }}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition text-sm"
                  >
                    Hủy
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
  const [options, setOptions] = useState(question.options)
  const [correctIndex, setCorrectIndex] = useState(question.correct_answer_index)
  const [explanation, setExplanation] = useState(question.explanation || '')

  useEffect(() => {
    if (isEditing) {
      setQuestionText(question.question_text)
      setOptions(question.options)
      setCorrectIndex(question.correct_answer_index)
      setExplanation(question.explanation || '')
    }
  }, [isEditing, question])

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  const handleSave = () => {
    if (!questionText.trim() || options.some(opt => !opt.trim())) {
      alert('Please fill in the question and all 4 options')
      return
    }
    onUpdate(question.id, {
      question_text: questionText.trim(),
      options: options.map(opt => opt.trim()),
      correct_answer_index: correctIndex,
      explanation: explanation.trim() || undefined,
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
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Options *</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correctOption-${question.id}`}
                    checked={correctIndex === idx}
                    onChange={() => setCorrectIndex(idx)}
                    className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-600 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Explanation (optional)"
            rows={2}
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
          <div className="text-white font-medium mb-3">{question.question_text}</div>
          <div className="space-y-1.5">
            {question.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className={`w-5 h-5 flex items-center justify-center rounded ${
                  idx === question.correct_answer_index 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {idx === question.correct_answer_index ? '✓' : String.fromCharCode(65 + idx)}
                </span>
                <span className={idx === question.correct_answer_index ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                  {opt}
                </span>
              </div>
            ))}
          </div>
          {question.explanation && (
            <div className="mt-2 text-xs text-slate-500 italic">
              {question.explanation}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition text-sm"
            title="Sửa"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-2 bg-slate-700 text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm"
            title="Xóa"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
