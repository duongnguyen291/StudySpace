'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, BookOpen, Play, Edit2, Trash2, X } from 'lucide-react'
import { FlashcardDeckList } from '../components/FlashcardDeckList'
import { ReviewSession } from '../components/ReviewSession'
import { Button } from '@/shared/components/Button'
import { useToast } from '@/shared/components'
import { flashcardService } from '../services/flashcardService'
import type {
  FlashcardDeck,
  FlashcardDeckCreate,
  FlashcardDeckUpdate,
  Flashcard,
  FlashcardCreate,
  ReviewSessionResponse,
  ReviewResult,
} from '../types/flashcard.types'

export function FlashcardsPage() {
  const router = useRouter()
  const { showToast } = useToast()

  // State
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeckForm, setShowDeckForm] = useState(false)
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null)
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [showFlashcardForm, setShowFlashcardForm] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [reviewSession, setReviewSession] = useState<ReviewSessionResponse | null>(null)

  // Form states
  const [deckTitle, setDeckTitle] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [flashcardQuestion, setFlashcardQuestion] = useState('')
  const [flashcardAnswer, setFlashcardAnswer] = useState('')
  const [flashcardHint, setFlashcardHint] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvImporting, setCsvImporting] = useState(false)

  // Load decks
  useEffect(() => {
    loadDecks()
  }, [])

  // Load flashcards when deck is selected
  useEffect(() => {
    if (selectedDeck) {
      loadFlashcards(selectedDeck.id)
    }
  }, [selectedDeck])

  const loadDecks = async () => {
    try {
      setLoading(true)
      const response = await flashcardService.getDecks()
      if (response) {
        setDecks(response.decks)
      }
    } catch (error) {
      showToast('Không thể tải bộ thẻ', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadFlashcards = async (deckId: string) => {
    try {
      const response = await flashcardService.getFlashcards(deckId)
      if (response) {
        setFlashcards(response.flashcards)
      }
    } catch (error) {
      showToast('Không thể tải thẻ', 'error')
      console.error(error)
    }
  }

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deckTitle.trim()) return

    try {
      const data: FlashcardDeckCreate = {
        title: deckTitle.trim(),
        description: deckDescription.trim() || undefined,
        is_public: false,
      }
      await flashcardService.createDeck(data)
      setDeckTitle('')
      setDeckDescription('')
      setShowDeckForm(false)
      loadDecks()
      showToast('Đã tạo bộ thẻ thành công!', 'success')
    } catch (error) {
      showToast('Không thể tạo bộ thẻ', 'error')
    }
  }

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDeck || !deckTitle.trim()) return

    try {
      const data: FlashcardDeckUpdate = {
        title: deckTitle.trim(),
        description: deckDescription.trim() || undefined,
      }
      await flashcardService.updateDeck(editingDeck.id, data)
      setEditingDeck(null)
      setDeckTitle('')
      setDeckDescription('')
      setShowDeckForm(false)
      loadDecks()
      showToast('Đã cập nhật bộ thẻ thành công!', 'success')
    } catch (error) {
      showToast('Không thể cập nhật bộ thẻ', 'error')
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bộ thẻ này? Tất cả thẻ sẽ bị xóa.')) return

    try {
      await flashcardService.deleteDeck(deckId)
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null)
        setFlashcards([])
      }
      loadDecks()
      showToast('Đã xóa bộ thẻ', 'success')
    } catch (error) {
      showToast('Không thể xóa bộ thẻ', 'error')
    }
  }

  const handleEditDeck = (deck: FlashcardDeck) => {
    setEditingDeck(deck)
    setDeckTitle(deck.title)
    setDeckDescription(deck.description || '')
    setShowDeckForm(true)
  }

  const handleCreateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeck || !flashcardQuestion.trim() || !flashcardAnswer.trim()) return

    try {
      const data: FlashcardCreate = {
        question: flashcardQuestion.trim(),
        answer: flashcardAnswer.trim(),
        hint: flashcardHint.trim() || undefined,
      }
      await flashcardService.createFlashcard(selectedDeck.id, data)
      setFlashcardQuestion('')
      setFlashcardAnswer('')
      setFlashcardHint('')
      setShowFlashcardForm(false)
      loadFlashcards(selectedDeck.id)
      showToast('Đã tạo thẻ thành công!', 'success')
    } catch (error) {
      showToast('Không thể tạo thẻ', 'error')
    }
  }

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!selectedDeck) return
    if (!confirm('Bạn có chắc muốn xóa thẻ này?')) return

    try {
      await flashcardService.deleteFlashcard(flashcardId, selectedDeck.id)
      loadFlashcards(selectedDeck.id)
      showToast('Đã xóa thẻ', 'success')
    } catch (error) {
      showToast('Không thể xóa thẻ', 'error')
    }
  }

  const handleImportCsv = async () => {
    if (!selectedDeck) return
    if (!csvFile) {
      showToast('Vui lòng chọn file CSV', 'error')
      return
    }
    setCsvImporting(true)
    try {
      const res = await flashcardService.importFlashcardsCsv(selectedDeck.id, csvFile)
      showToast(`Đã nhập ${res.flashcards_imported} thẻ`, 'success')
      loadFlashcards(selectedDeck.id)
      setCsvFile(null)
    } catch (error) {
      console.error(error)
      showToast('Không thể nhập CSV', 'error')
    } finally {
      setCsvImporting(false)
    }
  }

  const handleStartReview = async (deckId: string) => {
    try {
      const session = await flashcardService.startReviewSession({
        deck_id: deckId,
        mode: 'random',
        limit: 10,
      })
      if (session) {
        setReviewSession(session)
      }
    } catch (error) {
      showToast('Không thể bắt đầu phiên ôn tập', 'error')
      console.error(error)
    }
  }

  const handleCompleteReview = async (results: ReviewResult[]) => {
    if (!reviewSession) return

    try {
      await flashcardService.submitReviewResults(results)
      setReviewSession(null)
      showToast('Đã hoàn thành ôn tập!', 'success')
      if (selectedDeck) {
        loadFlashcards(selectedDeck.id)
      }
    } catch (error) {
      showToast('Không thể nộp kết quả ôn tập', 'error')
      console.error(error)
    }
  }

  const handleViewDeck = (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId)
    if (deck) {
      setSelectedDeck(deck)
    }
  }

  if (selectedDeck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDeck(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Decks
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{selectedDeck.title}</h1>
                {selectedDeck.description && (
                  <p className="text-gray-400 text-sm mt-1">{selectedDeck.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => handleStartReview(selectedDeck.id)}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Review
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingFlashcard(null)
                  setFlashcardQuestion('')
                  setFlashcardAnswer('')
                  setFlashcardHint('')
                  setShowFlashcardForm(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>

          {/* CSV Import */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 mb-6 flex items-center gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-white">Import flashcards from CSV</p>
              <p className="text-xs text-gray-400">Columns: question, answer, hint (optional)</p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-200 file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
            />
            <Button
              variant="primary"
              size="sm"
              disabled={!csvFile || csvImporting}
              onClick={handleImportCsv}
            >
              {csvImporting ? 'Importing...' : 'Import CSV'}
            </Button>
          </div>

          {/* Flashcard Form */}
          {showFlashcardForm && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingFlashcard ? 'Sửa thẻ' : 'Thẻ mới'}
                </h3>
                <button
                  onClick={() => {
                    setShowFlashcardForm(false)
                    setEditingFlashcard(null)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateFlashcard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Câu hỏi *
                  </label>
                  <textarea
                    value={flashcardQuestion}
                    onChange={(e) => setFlashcardQuestion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập câu hỏi..."
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Câu trả lời *
                  </label>
                  <textarea
                    value={flashcardAnswer}
                    onChange={(e) => setFlashcardAnswer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập câu trả lời..."
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gợi ý (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={flashcardHint}
                    onChange={(e) => setFlashcardHint(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Gợi ý tùy chọn..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowFlashcardForm(false)
                      setEditingFlashcard(null)
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingFlashcard ? 'Cập nhật' : 'Tạo'} Thẻ
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Flashcards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((flashcard) => (
              <div
                key={flashcard.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all"
              >
                <div className="mb-2">
                  <h4 className="font-semibold text-white mb-1">Q: {flashcard.question}</h4>
                  <p className="text-sm text-gray-400">A: {flashcard.answer}</p>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFlashcard(flashcard.id)}
                    className="!p-2 text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {flashcards.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">No flashcards yet</p>
                <Button
                  variant="primary"
                  onClick={() => setShowFlashcardForm(true)}
                >
                  Create Your First Flashcard
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Review Session Modal */}
        {reviewSession && (
          <ReviewSession
            session={reviewSession}
            onComplete={handleCompleteReview}
            onClose={() => setReviewSession(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Flashcards
            </h1>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingDeck(null)
              setDeckTitle('')
              setDeckDescription('')
              setShowDeckForm(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deck
          </Button>
        </div>

        {/* Deck Form */}
        {showDeckForm && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingDeck ? 'Sửa bộ thẻ' : 'Bộ thẻ mới'}
              </h3>
              <button
                onClick={() => {
                  setShowDeckForm(false)
                  setEditingDeck(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingDeck ? handleUpdateDeck : handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tiêu đề bộ thẻ..."
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả bộ thẻ..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeckForm(false)
                    setEditingDeck(null)
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary">
                  {editingDeck ? 'Cập nhật' : 'Tạo'} Bộ thẻ
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Decks List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading decks...</p>
          </div>
        ) : (
          <FlashcardDeckList
            decks={decks}
            onCreateDeck={() => {
              setEditingDeck(null)
              setDeckTitle('')
              setDeckDescription('')
              setShowDeckForm(true)
            }}
            onEditDeck={handleEditDeck}
            onDeleteDeck={handleDeleteDeck}
            onStartReview={handleStartReview}
            onViewDeck={handleViewDeck}
          />
        )}

        {/* Review Session Modal */}
        {reviewSession && (
          <ReviewSession
            session={reviewSession}
            onComplete={handleCompleteReview}
            onClose={() => setReviewSession(null)}
          />
        )}
      </div>
    </div>
  )
}

