'use client'

import { BookOpen, Edit2, Trash2, Play } from 'lucide-react'
import type { FlashcardDeck } from '../types/flashcard.types'
import { Button } from '@/shared/components/Button'

interface FlashcardDeckListProps {
  decks: FlashcardDeck[]
  onCreateDeck: () => void
  onEditDeck: (deck: FlashcardDeck) => void
  onDeleteDeck: (deckId: string) => void
  onStartReview: (deckId: string) => void
  onViewDeck: (deckId: string) => void
}

export function FlashcardDeckList({
  decks,
  onCreateDeck,
  onEditDeck,
  onDeleteDeck,
  onStartReview,
  onViewDeck,
}: FlashcardDeckListProps) {
  return (
    <div className="space-y-4">
      {decks.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No flashcard decks yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {deck.title}
                  </h3>
                  {deck.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>{deck.flashcard_count || 0} cards</span>
                <span>{new Date(deck.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDeck(deck.id)}
                  className="flex-1"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onStartReview(deck.id)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditDeck(deck)}
                  className="!p-2"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteDeck(deck.id)}
                  className="!p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

