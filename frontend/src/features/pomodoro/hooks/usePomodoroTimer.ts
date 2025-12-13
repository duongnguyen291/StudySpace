/**
 * Pomodoro Timer Hook (fixed logic)
 * - Single interval
 * - baselineSeconds lưu thời gian gốc phiên
 * - remainingSeconds đếm lùi
 * - Reset luôn trả về baseline
 * - Custom timer có baseline riêng (giữ sau Apply)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import type { SessionType } from '../types/pomodoro.types'
import { pomodoroService } from '../services/pomodoroService'

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

  // Loại phiên
  const [sessionType, setSessionType] = useState<SessionType>('work')
  // Số phiên work hoàn thành
  const [cycleCount, setCycleCount] = useState(0)

  // Trạng thái chạy
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Thời gian gốc của phiên hiện tại (giây)
  const [baselineSeconds, setBaselineSeconds] = useState(workDuration * 60)
  // Thời gian còn lại (giây)
  const [remainingSeconds, setRemainingSeconds] = useState(workDuration * 60)

  // customApplied cho biết đã Apply custom để không ghi đè baseline khi chuyển sang custom_timer
  const [customApplied, setCustomApplied] = useState(false)

  // Ref interval và timestamp để đảm bảo chạy chính xác khi tab không active
  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number | null>(null)
  const handleCompleteSessionRef = useRef<() => void>()

  // Derived hiển thị
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  // Lấy duration phút chuẩn theo sessionType (không gồm custom)
  const getStandardDurationMinutes = useCallback(
    (type: SessionType) => {
      switch (type) {
        case 'work': return workDuration
        case 'short_break': return shortBreakDuration
        case 'long_break': return longBreakDuration
        default: return workDuration
      }
    },
    [workDuration, shortBreakDuration, longBreakDuration]
  )

  // Khi đổi sessionType (preset), thiết lập baseline mới (trừ custom nếu đã apply)
  useEffect(() => {
    if (sessionType === 'custom_timer') {
      // Nếu vào custom mà chưa Apply → giữ nguyên (chờ setMinutes bên ngoài)
      if (!customApplied) return
      // Đã apply custom: không tự thay baseline nữa
      return
    }
    // Phiên preset: cập nhật baselineSeconds & remainingSeconds
    const newBaseline = getStandardDurationMinutes(sessionType) * 60
    setBaselineSeconds(newBaseline)
    setRemainingSeconds(newBaseline)
    setCustomApplied(false) // rời custom
  }, [sessionType, getStandardDurationMinutes, customApplied])

  // QUẢN LÝ INTERVAL - Sử dụng Date timestamps để đảm bảo chính xác khi tab không active
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (isPaused && startTimeRef.current) {
        // Lưu thời gian đã trôi qua khi pause
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        pausedTimeRef.current = elapsed
      }
      return
    }

    // Khi resume hoặc start mới
    if (!intervalRef.current) {
      // Tính toán thời gian đã trôi qua nếu đang resume
      const alreadyElapsed = pausedTimeRef.current || 0
      const targetRemaining = baselineSeconds - alreadyElapsed
      
      if (targetRemaining <= 0) {
        handleCompleteSessionRef.current?.()
        return
      }

      // Lưu thời gian bắt đầu (trừ đi thời gian đã trôi qua)
      startTimeRef.current = Date.now() - (alreadyElapsed * 1000)
      pausedTimeRef.current = null

      intervalRef.current = window.setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTimeRef.current!) / 1000)
        const newRemaining = Math.max(0, baselineSeconds - elapsed)
        
        setRemainingSeconds(newRemaining)
        
        if (newRemaining <= 0) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          startTimeRef.current = null
          handleCompleteSessionRef.current?.()
        }
      }, 100) // Update mỗi 100ms để mượt hơn, nhưng tính toán dựa trên timestamp
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, isPaused, baselineSeconds])

  const logWorkSession = useCallback(
    (durationMinutes: number) => {
      if (!isAuthenticated || durationMinutes <= 0) return

      const completedAt = new Date()
      const startedAt = new Date(
        completedAt.getTime() - durationMinutes * 60 * 1000
      )

      void pomodoroService
        .createSession({
          session_type: 'work',
          duration_minutes: durationMinutes,
          started_at: startedAt.toISOString(),
          completed_at: completedAt.toISOString(),
        })
        .catch((err) => {
          // Không làm vỡ UX Pomodoro nếu log thất bại
          console.error('Error logging pomodoro session', err)
        })
    },
    [isAuthenticated]
  )

  // Hoàn thành phiên
  const handleCompleteSession = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)

    // Phiên work hoàn thành đủ thời gian gốc → log toàn bộ phiên
    if (sessionType === 'work' && baselineSeconds > 0) {
      const durationMinutes = Math.round(baselineSeconds / 60)
      logWorkSession(durationMinutes)
    }

    // Chuyển phiên
    if (sessionType === 'work') {
      const nextCount = cycleCount + 1
      setCycleCount(nextCount)
      if (nextCount % longBreakEvery === 0) {
        setSessionType('long_break')
      } else {
        setSessionType('short_break')
      }
    } else if (sessionType === 'short_break' || sessionType === 'long_break') {
      setSessionType('work')
    } else if (sessionType === 'custom_timer') {
      // Sau custom quay về work
      setSessionType('work')
      setCustomApplied(false)
    }
  }, [sessionType, baselineSeconds, cycleCount, longBreakEvery, logWorkSession])

  // Cập nhật ref với callback mới nhất
  useEffect(() => {
    handleCompleteSessionRef.current = handleCompleteSession
  }, [handleCompleteSession])

  // Start
  const handleStart = useCallback(() => {
    if (isActive && isPaused) {
      setIsPaused(false)
      return
    }
    if (isActive) return
    // Reset refs khi start mới
    startTimeRef.current = null
    pausedTimeRef.current = null
    setIsActive(true)
    setIsPaused(false)
  }, [isActive, isPaused])

  // Pause
  const handlePause = useCallback(() => {
    if (!isActive) return
    setIsPaused(p => !p)
  }, [isActive])

  // Reset: quay về baselineSeconds
  const handleReset = useCallback(() => {
    // Nếu đang ở phiên work và đã chạy được một phần, log phần đã học
    if (
      isActive &&
      sessionType === 'work' &&
      baselineSeconds > 0 &&
      remainingSeconds < baselineSeconds
    ) {
      const elapsedSeconds = baselineSeconds - remainingSeconds
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
      logWorkSession(durationMinutes)
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    // Reset tất cả refs
    startTimeRef.current = null
    pausedTimeRef.current = null
    setIsActive(false)
    setIsPaused(false)
    setRemainingSeconds(baselineSeconds)
  }, [isActive, sessionType, baselineSeconds, remainingSeconds, logWorkSession])

  // External setMinutes (preset hoặc custom Apply)
  const setMinutesExternal = useCallback((mins: number) => {
    const sec = Math.max(0, Math.floor(mins) * 60)
    setBaselineSeconds(sec)      // cập nhật baseline
    setRemainingSeconds(sec)     // cập nhật còn lại
    if (sessionType === 'custom_timer') {
      setCustomApplied(true)
    } else {
      setCustomApplied(false)
    }
  }, [sessionType])

  // External setSeconds (chỉ chỉnh phần giây, giữ nguyên baseline nếu không phải apply custom đầy đủ)
  const setSecondsExternal = useCallback((secs: number) => {
    setRemainingSeconds(prev => {
      const m = Math.floor(prev / 60)
      return m * 60 + Math.min(59, Math.max(0, secs))
    })
  }, [])

  // Nhãn
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