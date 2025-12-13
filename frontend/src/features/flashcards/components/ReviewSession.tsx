'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReviewCard, ReviewSessionResponse, ReviewResult, ReviewMode } from '../types/flashcard.types'
import { FlashcardCard } from './FlashcardCard'
import { Button } from '@/shared/components/Button'
import { flashcardService } from '../services/flashcardService'

interface ReviewSessionProps {
  session: ReviewSessionResponse
  onComplete: (results: ReviewResult[]) => void
  onClose: () => void
}

export function ReviewSession({ session, onComplete, onClose }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Map<string, number>>(new Map())
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledCards, setShuffledCards] = useState<ReviewCard[]>([])

  // Shuffle cards if mode is random
  useEffect(() => {
    if (session.mode === 'random') {
      const shuffled = [...session.cards].sort(() => Math.random() - 0.5)
      setShuffledCards(shuffled)
    } else {
      setShuffledCards(session.cards)
    }
  }, [session])

  const currentCard = shuffledCards[currentIndex]
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100

  // Always reset flip when index changes
  useEffect(() => {
    setIsFlipped(false)
  }, [currentIndex])

  const handleConfidence = (level: number) => {
    if (!currentCard) return

    setResults(new Map(results.set(currentCard.flashcard.id, level)))
    
    // Auto-advance to next card after a short delay
    setTimeout(() => {
      if (currentIndex < shuffledCards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
      } else {
        // All cards reviewed, complete session
        completeSession()
      }
    }, 500)
  }

  const completeSession = () => {
    const reviewResults: ReviewResult[] = Array.from(results.entries()).map(([flashcard_id, confidence_level]) => ({
      flashcard_id,
      confidence_level,
    }))

    // Add any cards that weren't rated (default to 0)
    shuffledCards.forEach((card) => {
      if (!results.has(card.flashcard.id)) {
        reviewResults.push({
          flashcard_id: card.flashcard.id,
          confidence_level: 0,
        })
      }
    })

    onComplete(reviewResults)
  }

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      completeSession()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleSkip = () => {
    if (!currentCard) return
    setResults(new Map(results.set(currentCard.flashcard.id, 0)))
    handleNext()
  }

  if (!currentCard) {
    return null
  }


  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Phiên ôn tập</h2>
            <p className="text-sm text-gray-400 mt-1">
              {session.mode === 'random' ? 'Chế độ ngẫu nhiên' : 'Chế độ lặp lại ngắt quãng'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Thẻ {currentIndex + 1} / {shuffledCards.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(progress)}% Hoàn thành
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
          <div className="w-full max-w-2xl h-[400px]">
            <FlashcardCard
              key={currentCard.flashcard.id}
              flashcard={currentCard.flashcard}
              flipped={isFlipped}
              onFlip={() => setIsFlipped((prev) => !prev)}
              showHint={!!currentCard.flashcard.hint}
            />
          </div>
        </div>


        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Trước
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSkip}>
              Bỏ qua
            </Button>
            {currentIndex === shuffledCards.length - 1 ? (
              <Button variant="primary" onClick={completeSession}>
                Hoàn thành ôn tập
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext}>
                Tiếp
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

