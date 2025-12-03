'use client'
import React, { useState, useEffect, useCallback } from 'react'
import type { FlashcardDeck } from '@/features/flashcards/types/flashcard.types'
import { getDecks, deleteDeck, exportCsv, downloadBlob } from '@/features/flashcards/services/flashcardService'
import FlashcardImportExport from '@/features/flashcards/components/FlashcardImportExport'
import FlashcardReview from '@/features/flashcards/components/FlashcardReview'

type ViewMode = 'list' | 'import' | 'review'

export default function FlashcardsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadDecks = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getDecks()
      setDecks(data)
    } catch {}
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadDecks()
  }, [loadDecks])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deck?')) return
    setDeletingId(id)
    try {
      await deleteDeck(id)
      setDecks(prev => prev.filter(d => d.id !== id))
    } catch {}
    setDeletingId(null)
  }

  const handleExport = async (deck: FlashcardDeck) => {
    try {
      const blob = await exportCsv(deck.id)
      downloadBlob(blob, `${deck.title}.csv`)
    } catch {}
  }

  const handleReview = (deck: FlashcardDeck) => {
    setSelectedDeck(deck)
    setViewMode('review')
  }

  const handleBack = () => {
    setSelectedDeck(null)
    setViewMode('list')
    loadDecks()
  }

  const handleImportSuccess = () => {
    loadDecks()
    setViewMode('list')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {viewMode !== 'list' && (
                <button onClick={handleBack} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                  ← Back
                </button>
              )}
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🎴</span> Flashcards
              </h1>
            </div>

            {viewMode === 'list' && (
              <button
                onClick={() => setViewMode('import')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold text-sm shadow-lg"
              >
                📥 Import CSV
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {viewMode === 'list' && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse" />)}
                </div>
              ) : decks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <span className="text-4xl">🎴</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Flashcard Decks</h3>
                  <p className="text-slate-400 mb-6">Import your first deck from a CSV file</p>
                  <button
                    onClick={() => setViewMode('import')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg"
                  >
                    📥 Import CSV
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {decks.map(deck => (
                    <div
                      key={deck.id}
                      className="group bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/30 transition"
                    >
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition">
                        {deck.title}
                      </h3>
                      {deck.description && (
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{deck.description}</p>
                      )}
                      <p className="text-emerald-400 text-sm mb-4">🎴 {deck.card_count} cards</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(deck)}
                          disabled={deck.card_count === 0}
                          className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition"
                        >
                          ▶ Review
                        </button>
                        <button
                          onClick={() => handleExport(deck)}
                          className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
                          title="Export"
                        >
                          📤
                        </button>
                        <button
                          onClick={() => handleDelete(deck.id)}
                          disabled={deletingId === deck.id}
                          className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === deck.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === 'import' && (
            <FlashcardImportExport onImportSuccess={handleImportSuccess} />
          )}

          {viewMode === 'review' && selectedDeck && (
            <FlashcardReview
              deckId={selectedDeck.id}
              deckTitle={selectedDeck.title}
              onComplete={handleBack}
              onCancel={handleBack}
            />
          )}
        </main>
      </div>
    </div>
  )
}

