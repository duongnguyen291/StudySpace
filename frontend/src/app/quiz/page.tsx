'use client'
import React, { useState, useEffect, useCallback } from 'react'
import type { QuizSet, QuizSetCreate, QuizAttemptResult } from '@/features/quiz/types/quiz.types'
import { 
  getQuizSets, 
  createQuizSet, 
  deleteQuizSet, 
  exportCsv, 
  downloadBlob 
} from '@/features/quiz/services/quizService'
import QuizSetCard from '@/features/quiz/components/QuizSetCard'
import CreateQuizModal from '@/features/quiz/components/CreateQuizModal'
import QuizImportExport from '@/features/quiz/components/QuizImportExport'
import QuizPlayer from '@/features/quiz/components/QuizPlayer'
import QuizHistory from '@/features/quiz/components/QuizHistory'
import EditQuizForm from '@/features/quiz/components/EditQuizForm'

type ViewMode = 'dashboard' | 'import' | 'play' | 'history' | 'edit'
type TabMode = 'my-quizzes' | 'history'

export default function QuizPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [activeTab, setActiveTab] = useState<TabMode>('my-quizzes')
  const [quizSets, setQuizSets] = useState<QuizSet[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportQuiz, setExportQuiz] = useState<QuizSet | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Load quiz sets
  const loadQuizSets = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getQuizSets()
      setQuizSets(data)
    } catch (err) {
      console.error('Failed to load quiz sets:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuizSets()
  }, [loadQuizSets])

  // Handlers
  const handleCreateQuiz = async (data: QuizSetCreate) => {
    setIsCreating(true)
    try {
      await createQuizSet(data)
      await loadQuizSets()
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create quiz:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return
    
    setDeletingId(id)
    try {
      await deleteQuizSet(id)
      setQuizSets(prev => prev.filter(q => q.id !== id))
    } catch (err) {
      console.error('Failed to delete quiz:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportClick = (quizSet: QuizSet) => {
    setExportQuiz(quizSet)
    setShowExportModal(true)
  }

  const handleExportConfirm = async () => {
    if (!exportQuiz) return
    
    setIsExporting(true)
    try {
      const blob = await exportCsv(exportQuiz.id)
      downloadBlob(blob, `${exportQuiz.title.replace(/[^a-z0-9]/gi, '_')}.csv`)
      setShowExportModal(false)
      setExportQuiz(null)
    } catch (err) {
      console.error('Failed to export:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleEditQuiz = (quizSet: QuizSet) => {
    setSelectedQuiz(quizSet)
    setViewMode('edit')
  }

  const handlePlayQuiz = (quizSet: QuizSet) => {
    setSelectedQuiz(quizSet)
    setViewMode('play')
  }

  const handleQuizComplete = (result: QuizAttemptResult) => {
    console.log('Quiz completed:', result)
  }

  const handleBackToDashboard = () => {
    setSelectedQuiz(null)
    setViewMode('dashboard')
    loadQuizSets()
  }

  const handleImportSuccess = () => {
    loadQuizSets()
    setViewMode('dashboard')
  }

  // Stats
  const totalQuestions = quizSets.reduce((sum, q) => sum + q.question_count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {viewMode !== 'dashboard' && (
                  <button
                    onClick={handleBackToDashboard}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  >
                    ← Back
                  </button>
                )}
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Quiz & Flashcards
                  </h1>
                </div>
              </div>

              {viewMode === 'dashboard' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode('import')}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition text-sm font-medium flex items-center gap-2"
                  >
                    📥 Import CSV
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition text-sm font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    ➕ New Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {viewMode === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{quizSets.length}</div>
                      <div className="text-emerald-400 text-sm">Quiz Sets</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <span className="text-2xl">❓</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{totalQuestions}</div>
                      <div className="text-blue-400 text-sm">Total Questions</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">—</div>
                      <div className="text-purple-400 text-sm">Avg. Score</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl w-fit mb-6">
                <button
                  onClick={() => setActiveTab('my-quizzes')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                    activeTab === 'my-quizzes'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📚 My Quizzes
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                    activeTab === 'history'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📊 History
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'my-quizzes' && (
                <>
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-800/50 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : quizSets.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <span className="text-5xl">📝</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No Quizzes Yet</h3>
                      <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Create your first quiz to start learning. You can add questions manually or import from a CSV file.
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition font-semibold shadow-lg"
                        >
                          ➕ Create Quiz
                        </button>
                        <button
                          onClick={() => setViewMode('import')}
                          className="px-6 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition font-medium"
                        >
                          📥 Import CSV
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quizSets.map(quizSet => (
                        <QuizSetCard
                          key={quizSet.id}
                          quizSet={quizSet}
                          onPlay={() => handlePlayQuiz(quizSet)}
                          onEdit={() => handleEditQuiz(quizSet)}
                          onExport={() => handleExportClick(quizSet)}
                          onDelete={() => handleDeleteQuiz(quizSet.id)}
                          isDeleting={deletingId === quizSet.id}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <div className="max-w-3xl">
                  <QuizHistory limit={20} />
                </div>
              )}
            </>
          )}

          {viewMode === 'import' && (
            <QuizImportExport onImportSuccess={handleImportSuccess} />
          )}

          {viewMode === 'play' && selectedQuiz && (
            <QuizPlayer
              quizSetId={selectedQuiz.id}
              quizTitle={selectedQuiz.title}
              onComplete={handleQuizComplete}
              onCancel={handleBackToDashboard}
            />
          )}

          {viewMode === 'edit' && selectedQuiz && (
            <EditQuizForm
              quizSetId={selectedQuiz.id}
              onBack={handleBackToDashboard}
              onSave={handleBackToDashboard}
            />
          )}
        </main>
      </div>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateQuiz}
        isLoading={isCreating}
      />

      {/* Export Confirmation Modal */}
      {showExportModal && exportQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Export Quiz</h3>
            <p className="text-slate-400 mb-6">
              Download <span className="text-emerald-400 font-medium">"{exportQuiz.title}"</span> as a CSV file?
            </p>
            
            <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Questions:</span>
                <span className="text-white font-medium">{exportQuiz.question_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-400">Format:</span>
                <span className="text-white font-medium">CSV (question, answer)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExportConfirm}
                disabled={isExporting}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl transition font-semibold shadow-lg disabled:opacity-50"
              >
                {isExporting ? '⏳ Exporting...' : '📥 Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
