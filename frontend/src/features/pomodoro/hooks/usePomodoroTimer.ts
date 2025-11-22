/**
 * Pomodoro Timer Hook
 * Manages timer state and logic
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { pomodoroService } from '../services/pomodoroService'
import type { SessionType } from '../types/pomodoro.types'

interface UsePomodoroTimerProps {
  workDuration?: number
  shortBreakDuration?: number
  longBreakDuration?: number
}

export const usePomodoroTimer = ({
  workDuration = 25,
  shortBreakDuration = 5,
  longBreakDuration = 15,
}: UsePomodoroTimerProps = {}) => {
  const { isAuthenticated } = useAuth()
  const [sessionType, setSessionType] = useState<SessionType>('work')
  const [minutes, setMinutes] = useState(workDuration)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const getCurrentDuration = useCallback(() => {
    switch (sessionType) {
      case 'work':
        return workDuration
      case 'short_break':
        return shortBreakDuration
      case 'long_break':
        return longBreakDuration
      default:
        return workDuration
    }
  }, [sessionType, workDuration, shortBreakDuration, longBreakDuration])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                // Timer completed
                setIsActive(false)
                setIsPaused(false)
                
                // Complete session if authenticated
                if (currentSessionId && isAuthenticated) {
                  pomodoroService.completeSession(currentSessionId).catch(console.error)
                }

                // Play notification sound
                if (typeof window !== 'undefined' && 'Audio' in window) {
                  const audio = new Audio('/notification.mp3')
                  audio.play().catch(() => {})
                }

                // Switch session type
                setSessionType((prevType) => {
                  if (prevType === 'work') {
                    setCompletedCycles((prev) => {
                      const newCycles = prev + 1
                      if (newCycles % 4 === 0) {
                        setMinutes(longBreakDuration)
                        return newCycles
                      } else {
                        setMinutes(shortBreakDuration)
                        return newCycles
                      }
                    })
                    return 'short_break'
                  } else {
                    setMinutes(workDuration)
                    return 'work'
                  }
                })
                
                setSeconds(0)
                setCurrentSessionId(null)
                return 0
              }
              return prevMinutes - 1
            })
            return 59
          }
          return prevSeconds - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, isPaused, currentSessionId, isAuthenticated, workDuration, shortBreakDuration, longBreakDuration])

  const handleStart = useCallback(async () => {
    if (!isActive && !currentSessionId) {
      // Start new session
      if (isAuthenticated) {
        try {
          const session = await pomodoroService.createSession({
            session_type: sessionType,
            duration_minutes: getCurrentDuration(),
          })
          setCurrentSessionId(session.id)
        } catch (error) {
          console.error('Failed to create session:', error)
        }
      }
      setIsActive(true)
      setIsPaused(false)
    } else if (isPaused) {
      // Resume from pause
      setIsPaused(false)
      setIsActive(true)
    }
  }, [isActive, currentSessionId, isAuthenticated, sessionType, getCurrentDuration])

  const handlePause = useCallback(() => {
    setIsPaused(true)
    setIsActive(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setMinutes(getCurrentDuration())
    setSeconds(0)
    setCurrentSessionId(null)
  }, [getCurrentDuration])

  const handleComplete = useCallback(async () => {
    setIsActive(false)
    setIsPaused(false)

    // Complete session if authenticated
    if (currentSessionId && isAuthenticated) {
      try {
        await pomodoroService.completeSession(currentSessionId)
      } catch (error) {
        console.error('Failed to complete session:', error)
      }
    }

    // Play notification sound
    if (typeof window !== 'undefined' && 'Audio' in window) {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(() => {})
    }

    // Switch session type
    if (sessionType === 'work') {
      const newCycles = completedCycles + 1
      setCompletedCycles(newCycles)
      
      // After 4 work sessions, take long break
      if (newCycles % 4 === 0) {
        setSessionType('long_break')
        setMinutes(longBreakDuration)
      } else {
        setSessionType('short_break')
        setMinutes(shortBreakDuration)
      }
    } else {
      // Break finished, back to work
      setSessionType('work')
      setMinutes(workDuration)
    }
    
    setSeconds(0)
    setCurrentSessionId(null)
  }, [currentSessionId, isAuthenticated, sessionType, completedCycles, workDuration, shortBreakDuration, longBreakDuration])

  const getSessionTypeLabel = useCallback(() => {
    switch (sessionType) {
      case 'work':
        return 'Làm việc'
      case 'short_break':
        return 'Nghỉ ngắn'
      case 'long_break':
        return 'Nghỉ dài'
      default:
        return 'Làm việc'
    }
  }, [sessionType])

  return {
    minutes,
    seconds,
    isActive,
    isPaused,
    sessionType,
    completedCycles,
    handleStart,
    handlePause,
    handleReset,
    getSessionTypeLabel,
  }
}

