'use client'
import React, { useState, useEffect, useCallback } from 'react'
import type {
  QuizAttemptDetail,
  QuizAttemptResult,
  QuizQuestionForAttempt,
  QuizAttemptAnswer
} from '../types/quiz.types'
import { startAttempt, submitAttempt, shuffleQuestions } from '../services/quizService'

interface Props {
  quizSetId: string
  quizTitle: string
  onComplete?: (result: QuizAttemptResult) => void
  onCancel?: () => void
}

type PlayerState = 'config' | 'playing' | 'completed'

export default function QuizPlayer({ quizSetId, quizTitle, onComplete, onCancel }: Props): JSX.Element {
  const [state, setState] = useState<PlayerState>('config')
  const [shuffleEnabled, setShuffleEnabled] = useState(false)
  const [attempt, setAttempt] = useState<QuizAttemptDetail | null>(null)
  const [displayQuestions, setDisplayQuestions] = useState<QuizQuestionForAttempt[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<QuizAttemptResult | null>(null)

  const currentQuestion = displayQuestions[currentIndex]

  const handleStartQuiz = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const attemptData = await startAttempt({ quiz_set_id: quizSetId })
      setAttempt(attemptData)
      
      // Shuffle questions on the client side if enabled
      const questions = shuffleEnabled 
        ? shuffleQuestions(attemptData.questions)
        : attemptData.questions
      
      setDisplayQuestions(questions)
      setStartTime(Date.now())
      setState('playing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))
  }

  const handleNext = () => {
    if (currentIndex < displayQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setShowAnswer(false)
    }
  }

  const handleSubmit = async () => {
    if (!attempt) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      const answerList: QuizAttemptAnswer[] = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        user_answer: answer
      }))
      
      const resultData = await submitAttempt(attempt.id, {
        answers: answerList,
        time_spent_seconds: timeSpent
      })
      
      setResult(resultData)
      setState('completed')
      
      if (onComplete) {
        onComplete(resultData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setAttempt(null)
    setDisplayQuestions([])
    setCurrentIndex(0)
    setAnswers({})
    setShowAnswer(false)
    setStartTime(0)
    setResult(null)
    setError(null)
    setState('config')
  }

  const getElapsedTime = useCallback(() => {
    if (!startTime) return '00:00'
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [startTime])

  const [elapsedTime, setElapsedTime] = useState('00:00')

  useEffect(() => {
    if (state === 'playing' && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(getElapsedTime())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [state, startTime, getElapsedTime])

  const answeredCount = Object.keys(answers).length
  const totalQuestions = displayQuestions.length
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0

  // Configuration Screen
  if (state === 'config') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">{quizTitle}</h2>
          <p className="text-slate-400 mb-8">Configure your quiz session</p>

          {/* Shuffle Toggle */}
          <div className="bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">🔀 Shuffle Questions</h3>
                <p className="text-sm text-slate-400 mt-1">Randomize question order</p>
              </div>
              <button
                onClick={() => setShuffleEnabled(!shuffleEnabled)}
                className={`relative w-14 h-7 rounded-full transition-colors ${shuffleEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${shuffleEnabled ? 'translate-x-7' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-300 text-sm">
              ❌ {error}
            </div>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <button onClick={onCancel} className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition font-medium">
                Cancel
              </button>
            )}
            <button
              onClick={handleStartQuiz}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition shadow-lg"
            >
              {isLoading ? '⏳ Loading...' : '🚀 Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Playing Screen
  if (state === 'playing' && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">{quizTitle}</h2>
            <p className="text-sm text-slate-400">
              Question {currentIndex + 1} of {totalQuestions}
              {shuffleEnabled && <span className="ml-2 text-purple-400">🔀</span>}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">⏱️ {elapsedTime}</span>
            <button onClick={onCancel} className="text-slate-400 hover:text-white">✕</button>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-700 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden mb-6">
          {/* Question */}
          <div className="p-8">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Question</span>
            <p className="text-xl text-white mt-2 leading-relaxed">{currentQuestion.question_text}</p>
          </div>

          {/* Answer Input */}
          <div className="p-6 bg-slate-900/50 border-t border-slate-700">
            <label className="text-sm text-slate-400 mb-2 block">Your Answer</label>
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition"
            />
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
            {displayQuestions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setShowAnswer(false) }}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  idx === currentIndex ? 'bg-emerald-500' : answers[displayQuestions[idx].id] ? 'bg-emerald-500/40' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>

          {currentIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading || answeredCount < totalQuestions}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 transition shadow-lg"
            >
              {isLoading ? '⏳' : '✅ Submit'}
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

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
            ❌ {error}
          </div>
        )}
      </div>
    )
  }

  // Completed Screen
  if (state === 'completed' && result) {
    const percentage = result.score || 0
    const isPassed = percentage >= 70

    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isPassed ? 'bg-emerald-500/20' : 'bg-orange-500/20'}`}>
            <span className="text-4xl">{isPassed ? '🎉' : '📚'}</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{isPassed ? 'Great Job!' : 'Keep Practicing!'}</h2>
          
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl my-6 ${isPassed ? 'bg-emerald-500/20' : 'bg-orange-500/20'}`}>
            <span className="text-4xl font-bold text-white">{percentage.toFixed(0)}%</span>
            <div className="text-left">
              <div className={`font-semibold ${isPassed ? 'text-emerald-400' : 'text-orange-400'}`}>
                {result.correct_answers}/{result.total_questions}
              </div>
              <div className="text-slate-400 text-sm">Correct</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleRetry} className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition">
              🔄 Try Again
            </button>
            {onCancel && (
              <button onClick={onCancel} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl transition shadow-lg">
                ✅ Done
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <div className="text-center text-slate-400 py-12">Loading...</div>
}
