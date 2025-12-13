'use client'

import { useEffect, useState } from 'react'
import { RotateCcw, Lightbulb } from 'lucide-react'
import type { Flashcard } from '../types/flashcard.types'
import { Button } from '@/shared/components/Button'

interface FlashcardCardProps {
  flashcard: Flashcard
  onFlip?: () => void
  showHint?: boolean
  className?: string
  flipped?: boolean
}

export function FlashcardCard({
  flashcard,
  onFlip,
  showHint = false,
  className = '',
  flipped,
}: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showHintText, setShowHintText] = useState(showHint)

  // Sync flip state from parent when provided
  useEffect(() => {
    if (typeof flipped === 'boolean') {
      setIsFlipped(flipped)
    }
  }, [flipped])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.()
  }

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side - Question */}
        <div
          className="absolute w-full h-full rounded-xl p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl cursor-pointer flex flex-col justify-between"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          onClick={handleFlip}
        >
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="mb-4">
              <span className="text-sm font-medium text-blue-200 uppercase tracking-wide">
                Câu hỏi
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4 leading-relaxed">
              {flashcard.question}
            </h3>
            {flashcard.hint && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowHintText(!showHintText)
                }}
                className="mt-4 flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm">Hiện gợi ý</span>
              </button>
            )}
            {showHintText && flashcard.hint && (
              <div className="mt-4 p-4 bg-blue-500/30 rounded-lg text-sm">
                {flashcard.hint}
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-200">Nhấn để lật</p>
          </div>
        </div>

        {/* Back Side - Answer */}
        <div
          className="absolute w-full h-full rounded-xl p-8 bg-gradient-to-br from-green-600 to-green-800 text-white shadow-2xl cursor-pointer flex flex-col justify-center items-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          onClick={handleFlip}
        >
          <div className="mb-4">
            <span className="text-sm font-medium text-green-200 uppercase tracking-wide">
              Câu trả lời
            </span>
          </div>
          <h3 className="text-2xl font-bold leading-relaxed">
            {flashcard.answer}
          </h3>
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleFlip()
              }}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Lật lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

