/**
 * Pomodoro Timer Hook
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

  const [remainingSeconds, setRemainingSeconds] = useState(workDuration * 60)
  const intervalRef = useRef<number | null>(null)

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const getTargetMinutes = useCallback(() => {
    switch (sessionType) {
      case 'work': return workDuration
      case 'short_break': return shortBreakDuration
      case 'long_break': return longBreakDuration
      case 'custom_timer': return Math.max(1, Math.ceil(remainingSeconds / 60))
      default: return workDuration
    }
  }, [sessionType, workDuration, shortBreakDuration, longBreakDuration, remainingSeconds])

  useEffect(() => {
    if (sessionType === 'custom_timer') return
    setRemainingSeconds(getTargetMinutes() * 60)
  }, [sessionType, getTargetMinutes])

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

  const completeCurrentSession = useCallback(async () => {
    setIsActive(false)
    setIsPaused(false)
    if (currentSessionId && isAuthenticated) {
      pomodoroService.completeSession(currentSessionId).catch(() => {})
    }
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
      setIsPaused(false)
      return
    }
    if (isActive) return
    if (isAuthenticated && !currentSessionId) {
      try {
        const session = await pomodoroService.createSession({
          session_type: sessionType,
          duration_minutes: getTargetMinutes()
        })
        setCurrentSessionId(session.id)
      } catch {}
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
    if (sessionType === 'custom_timer') return
    setRemainingSeconds(getTargetMinutes() * 60)
    setCurrentSessionId(null)
  }, [getTargetMinutes, sessionType])

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
      case 'custom_timer': return 'Tùy chỉnh thời gian'
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