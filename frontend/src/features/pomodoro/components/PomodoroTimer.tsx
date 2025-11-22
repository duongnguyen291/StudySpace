'use client'

/**
 * PomodoroTimer Component
 * Simple display component - logic is in usePomodoroTimer hook
 */
interface PomodoroTimerProps {
  minutes: number
  seconds: number
  currentTask?: string
}

export const PomodoroTimer = ({ minutes, seconds, currentTask }: PomodoroTimerProps) => {
  return (
    <div className="flex flex-col items-center">
      {/* Timer Display - Large and Centered */}
      <div className="relative w-96 h-96 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl font-mono font-bold text-white drop-shadow-2xl">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Task Display */}
      {currentTask && (
        <div className="mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
          <p className="text-white/90 text-sm">{currentTask}</p>
        </div>
      )}
    </div>
  )
}

