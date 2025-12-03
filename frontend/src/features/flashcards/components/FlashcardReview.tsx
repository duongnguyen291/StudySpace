'use client'
import React, { useState, useEffect } from 'react'
import type { Flashcard } from '../types/flashcard.types'
import { getCardsForReview, shuffleArray } from '../services/flashcardService'

interface Props {
  deckId: string
  deckTitle: string
  onComplete?: () => void
  onCancel?: () => void
}

export default function FlashcardReview({ deckId, deckTitle, onComplete, onCancel }: Props): JSX.Element {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffleEnabled, setShuffleEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(true)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())

  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0

  const loadCards = async (shuffle: boolean) => {
    setIsLoading(true)
    try {
      let data = await getCardsForReview(deckId, false)
      if (shuffle) {
        data = shuffleArray(data)
      }
      setCards(data)
    } catch {
      setCards([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStart = () => {
    loadCards(shuffleEnabled)
    setShowConfig(false)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      setReviewedIds(prev => new Set(prev).add(currentCard.id))
    }
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }

  const handleFinish = () => {
    if (onComplete) onComplete()
  }

  // Config screen
  if (showConfig) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">{deckTitle}</h2>
          <p className="text-slate-400 mb-8">Configure your review session</p>

          {/* Shuffle Toggle */}
          <div className="bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">🔀 Shuffle Cards</h3>
                <p className="text-sm text-slate-400 mt-1">Randomize card order</p>
              </div>
              <button
                onClick={() => setShuffleEnabled(!shuffleEnabled)}
                className={`relative w-14 h-7 rounded-full transition-colors ${shuffleEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${shuffleEnabled ? 'translate-x-7' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <button onClick={onCancel} className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition font-medium">
                Cancel
              </button>
            )}
            <button
              onClick={handleStart}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition shadow-lg"
            >
              🚀 Start Review
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center text-slate-400 py-12">Loading cards...</div>
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No cards in this deck</p>
        <button onClick={onCancel} className="mt-4 text-emerald-400 hover:underline">Go back</button>
      </div>
    )
  }

  // Review screen
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">{deckTitle}</h2>
          <p className="text-sm text-slate-400">
            Card {currentIndex + 1} of {cards.length}
            {shuffleEnabled && <span className="ml-2 text-purple-400">🔀 Shuffled</span>}
          </p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition">✕ Exit</button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-700 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Flashcard */}
      <div className="perspective-1000 mb-8" style={{ perspective: '1000px' }}>
        <div
          onClick={handleFlip}
          className={`relative w-full h-80 cursor-pointer transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front (Question) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 flex flex-col items-center justify-center backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-xs text-slate-500 uppercase tracking-wider mb-4">Question</span>
            <p className="text-xl text-white text-center leading-relaxed">{currentCard.question}</p>
            <p className="mt-6 text-sm text-slate-500">Click to reveal answer</p>
          </div>

          {/* Back (Answer) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-2xl border border-emerald-500/30 p-8 flex flex-col items-center justify-center rotate-y-180 backface-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-xs text-emerald-400 uppercase tracking-wider mb-4">Answer</span>
            <p className="text-xl text-white text-center leading-relaxed">{currentCard.answer}</p>
            <p className="mt-6 text-sm text-slate-500">Click to see question</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ← Previous
        </button>

        <div className="flex gap-1">
          {cards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setIsFlipped(false) }}
              className={`w-2.5 h-2.5 rounded-full transition ${
                idx === currentIndex ? 'bg-emerald-500' : reviewedIds.has(cards[idx].id) ? 'bg-emerald-500/40' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {currentIndex === cards.length - 1 ? (
          <button
            onClick={handleFinish}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition shadow-lg"
          >
            ✅ Finish
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

