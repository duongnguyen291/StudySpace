/**
 * Pomodoro Feature Module
 * Public API exports
 */

export { PomodoroTimer } from './components/PomodoroTimer'
export { LoginModal } from './components/LoginModal'
export { RegisterModal } from './components/RegisterModal'
export { YouTubeBackground } from './components/YouTubeBackground'
export { BackgroundSettings } from './components/BackgroundSettings'

export { useBackground } from './hooks/useBackground'
export { usePomodoroTimer } from './hooks/usePomodoroTimer'

export type { PomodoroSession, PomodoroSessionCreate, PomodoroStats, SessionType } from './types/pomodoro.types'

