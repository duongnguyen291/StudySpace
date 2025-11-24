/**
 * Pomodoro Timer Hook (refactored)
 * Single source of truth = remainingSeconds
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { pomodoroService } from '../services/pomodoroService'
import type { SessionType } from '../types/pomodoro.types'

interface UsePomodoroTimerProps {
  workDuration?: number
  shortBreakDuration?: number
  longBreakDuration?: number
  longBreakEvery?: number
}

export const usePomodoroTimer = ({
  workDuration = 25,
  shortBreakDuration = 5,
  longBreakDuration = 15,
  longBreakEvery = 4
}: UsePomodoroTimerProps = {}) => {
  const { isAuthenticated } = useAuth()

  const [sessionType, setSessionType] = useState<SessionType>('work')
  const [cycleCount, setCycleCount] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // ONE state for countdown
  const [remainingSeconds, setRemainingSeconds] = useState(workDuration * 60)
  const intervalRef = useRef<number | null>(null)

  // Derived display values
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  // Duration (minutes) for current type
  const getTargetMinutes = useCallback(() => {
    if (sessionType === 'work') return workDuration
    if (sessionType === 'short_break') return shortBreakDuration
    return longBreakDuration
  }, [sessionType, workDuration, shortBreakDuration, longBreakDuration])

  // Reset remainingSeconds whenever sessionType changes
  useEffect(() => {
    setRemainingSeconds(getTargetMinutes() * 60)
  }, [sessionType, getTargetMinutes])

  // Interval control
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            // Session finished
            clearInterval(intervalRef.current!)
            intervalRef.current = null
            completeCurrentSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, isPaused])

  // Complete + switch session
  const completeCurrentSession = useCallback(async () => {
    setIsActive(false)
    setIsPaused(false)

    // Notify backend
    if (currentSessionId && isAuthenticated) {
      pomodoroService.completeSession(currentSessionId).catch(console.error)
    }

    // Sound
    if (typeof window !== 'undefined' && 'Audio' in window) {
      new Audio('/notification.mp3').play().catch(() => {})
    }

    if (sessionType === 'work') {
      const newCount = cycleCount + 1
      setCycleCount(newCount)
      if (newCount % longBreakEvery === 0) {
        setSessionType('long_break')
      } else {
        setSessionType('short_break')
      }
    } else {
      setSessionType('work')
    }
    setCurrentSessionId(null)
  }, [currentSessionId, isAuthenticated, sessionType, cycleCount, longBreakEvery])

  const handleStart = useCallback(async () => {
    if (isActive && isPaused) {
      // resume
      setIsPaused(false)
      setIsActive(true)
      return
    }
    if (isActive) return

    // Create session on backend
    if (isAuthenticated && !currentSessionId) {
      try {
        const session = await pomodoroService.createSession({
          session_type: sessionType,
          duration_minutes: getTargetMinutes()
        })
        setCurrentSessionId(session.id)
      } catch (e) {
        console.error('Failed to create session:', e)
      }
    }
    setIsActive(true)
    setIsPaused(false)
  }, [isActive, isPaused, isAuthenticated, currentSessionId, sessionType, getTargetMinutes])

  const handlePause = useCallback(() => {
    if (!isActive) return
    setIsPaused(p => !p)
  }, [isActive])

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsActive(false)
    setIsPaused(false)
    setRemainingSeconds(getTargetMinutes() * 60)
    setCurrentSessionId(null)
  }, [getTargetMinutes])

  // External setters (preserve old API)
  const setMinutesExternal = useCallback((mins: number) => {
    setRemainingSeconds(Math.max(0, Math.floor(mins) * 60))
  }, [])

  const setSecondsExternal = useCallback((secs: number) => {
    setRemainingSeconds(prev => {
      const m = Math.floor(prev / 60)
      return m * 60 + Math.min(59, Math.max(0, secs))
    })
  }, [])

  const getSessionTypeLabel = useCallback(() => {
    switch (sessionType) {
      case 'work': return 'Làm việc'
      case 'short_break': return 'Nghỉ ngắn'
      case 'long_break': return 'Nghỉ dài'
      case 'custom_timer': return 'Tùy chỉnh'
      default: return 'Làm việc'
    }
  }, [sessionType])

  return {
    minutes,
    seconds,
    isActive,
    isPaused,
    sessionType,
    completedCycles: cycleCount,
    handleStart,
    handlePause,
    handleReset,
    getSessionTypeLabel,
    setSessionType,
    setMinutes: setMinutesExternal,
    setSeconds: setSecondsExternal,
  }
}