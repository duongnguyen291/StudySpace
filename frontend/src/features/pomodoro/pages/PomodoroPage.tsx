'use client'

import { useState } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { LoginModal } from '@/features/pomodoro/components/LoginModal'
import { RegisterModal } from '@/features/pomodoro/components/RegisterModal'
import { YouTubeBackground } from '@/features/pomodoro/components/YouTubeBackground'
import { BackgroundSettings } from '@/features/pomodoro/components/BackgroundSettings'
import { useBackground } from '@/features/pomodoro/hooks/useBackground'
import { usePomodoroTimer } from '@/features/pomodoro/hooks/usePomodoroTimer'
import { Button } from '@/shared/components/Button'
import {
  LogOut,
  BarChart3,
  Video,
  Image as ImageIcon,
  Music,
  CloudRain,
  Grid3x3,
  Users,
  MessageCircle,
  Zap,
  Pause,
  RotateCcw,
  Play
} from 'lucide-react'

export default function PomodoroPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { youtubeUrl, updateBackground } = useBackground()

  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customHours, setCustomHours] = useState(0)
  const [customMinutes, setCustomMinutes] = useState(25)

  const {
    minutes,
    seconds,
    isActive,
    isPaused,
    completedCycles,
    handleStart,
    handlePause,
    handleReset,
    getSessionTypeLabel,
    setSessionType,
    setMinutes,
    setSeconds,
    sessionType
  } = usePomodoroTimer()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-white/70">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <YouTubeBackground videoId={youtubeUrl} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="w-full px-6 py-4 flex justify-between items-center bg-black/25 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">StudySpace</h1>
            <span className="text-sm text-white/70">Learning Core</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                  <span className="text-xs text-white/70">Tiến độ</span>
                </div>
                <BarChart3 className="w-5 h-5 text-white/80 cursor-pointer hover:text-white" title="Thống kê" />
                <Video className="w-5 h-5 text-white/80 cursor-pointer hover:text-white" title="Video nền" />
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-white/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRegister(true)}
                  className="bg-white text-gray-900 hover:bg-white/90"
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl">

            {/* Tag selector */}
            <div className="mb-5">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="">Chọn tag</option>
                <option value="study">Học</option>
                <option value="work">Làm việc</option>
                <option value="reading">Đọc sách</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            {/* Timer display */}
            <div className="mb-8 flex items-center justify-center">
              <div className="text-9xl font-mono font-bold text-white drop-shadow-lg">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>

            {/* Task + Controls */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="Bạn đang làm gì?"
                className="flex-1 px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={isActive}
              />
              {!isActive ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStart}
                  className="px-8 py-3 bg-white text-gray-900 hover:bg-white/90 font-semibold"
                >
                  Start
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePause}
                    className="px-6 py-3 bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold flex items-center gap-2"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                    className="px-6 py-3 bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>
              )}
            </div>

            {currentTask && (
              <div className="mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white/90 text-sm text-center">{currentTask}</p>
              </div>
            )}

            {/* Session label */}
            <div className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg mb-4">
              <p className="text-white/80 text-sm text-center">
                {getSessionTypeLabel()} {completedCycles > 0 && `• Hoàn thành ${completedCycles} phiên`}
              </p>
            </div>

            {/* Preset dots */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setSessionType('work')
                  setMinutes(25)
                  setSeconds(0)
                  if (isActive) handleReset()
                  setShowCustomInput(false)
                }}
                className={`
                  w-4 h-4 rounded-full
                  ${sessionType === 'work' && minutes === 25 && !showCustomInput ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'}
                  transition-all
                `}
                title="25 phút - Làm việc"
              />
              <button
                type="button"
                onClick={() => {
                  setSessionType('short_break')
                  setMinutes(5)
                  setSeconds(0)
                  if (isActive) handleReset()
                  setShowCustomInput(false)
                }}
                className={`
                  w-4 h-4 rounded-full
                  ${sessionType === 'short_break' && minutes === 5 && !showCustomInput ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'}
                  transition-all
                `}
                title="5 phút - Nghỉ ngắn"
              />
              <button
                type="button"
                onClick={() => {
                  setSessionType('long_break')
                  setMinutes(15)
                  setSeconds(0)
                  if (isActive) handleReset()
                  setShowCustomInput(false)
                }}
                className={`
                  w-4 h-4 rounded-full
                  ${sessionType === 'long_break' && minutes === 15 && !showCustomInput ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'}
                  transition-all
                `}
                title="15 phút - Nghỉ dài"
              />
              <button
                type="button"
                onClick={() => {
                  setSessionType('custom_timer')
                  setShowCustomInput(v => !v)
                }}
                className={`
                  w-4 h-4 rounded-full
                  ${sessionType === 'custom_timer' ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'}
                  transition-all
                `}
                title="Tùy chỉnh thời gian"
              />
            </div>

            {/* Custom time panel */}
            {showCustomInput && (
              <div className="flex flex-col items-center gap-5 mb-10 animate-in fade-in">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <label className="text-xs text-white/70 mb-1">Giờ</label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={customHours}
                      onChange={(e) => setCustomHours(Math.min(12, Math.max(0, Number(e.target.value))))}
                      className="w-20 px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white text-center focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <span className="text-white/60 font-mono text-xl">:</span>
                  <div className="flex flex-col items-center">
                    <label className="text-xs text-white/70 mb-1">Phút</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
                      className="w-20 px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white text-center focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>

                <div className="text-white/80 text-sm">
                  Thời gian: <span className="font-mono">{String(customHours).padStart(2, '0')}h {String(customMinutes).padStart(2, '0')}m</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomHours(0)
                      setCustomMinutes(25)
                    }}
                    className="px-4 py-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const total = customHours * 60 + customMinutes
                      if (total <= 0) return
                      setSessionType('custom_timer')
                      setMinutes(total)
                      setSeconds(0)
                      if (isActive) handleReset()
                      setShowCustomInput(false)
                    }}
                    className="px-4 py-2 bg-white text-gray-900 hover:bg-white/90 font-semibold"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* FOOTER với các nút phụ */}
        <footer className="w-full px-6 py-4 flex justify-between items-center bg-black/25 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBackgroundSettings(true)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Đổi nền"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Âm thanh mưa"
            >
              <CloudRain className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Nhạc"
            >
              <Music className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Menu"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Học nhóm"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Chat"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Chế độ tập trung"
            >
              <Zap className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Cài đặt hẹn giờ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false)
            setShowRegister(true)
          }}
        />
      )}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false)
            setShowLogin(true)
          }}
        />
      )}
      {showBackgroundSettings && (
        <BackgroundSettings
          currentUrl={youtubeUrl}
          onClose={() => setShowBackgroundSettings(false)}
          onSave={updateBackground}
        />
      )}
    </div>
  )
}