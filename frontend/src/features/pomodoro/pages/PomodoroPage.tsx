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
  RotateCcw
} from 'lucide-react'

export default function PomodoroPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { youtubeUrl, updateBackground } = useBackground()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

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
  } = usePomodoroTimer()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* YouTube Background */}
      <YouTubeBackground videoId={youtubeUrl} />

      {/* Main Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="w-full px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">
              StudySpace
            </h1>
            <span className="text-sm text-white/70">Learning Core</span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span>0m</span>
                </div>
                <BarChart3 className="w-5 h-5 text-white/90 cursor-pointer hover:text-white" />
                <Video className="w-5 h-5 text-white/90 cursor-pointer hover:text-white" />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-white/90">User's room</span>
                </div>
              </>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username || 'User'} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
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

        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl">
            {/* Tag Selector */}
            <div className="mb-4">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="">Select a tag</option>
                <option value="study">Study</option>
                <option value="work">Work</option>
                <option value="reading">Reading</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            {/* Pomodoro Timer Display */}
            <div className="mb-8 flex items-center justify-center">
              <div className="text-9xl font-mono font-bold text-white drop-shadow-2xl">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>

            {/* Task Input and Start Button */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="What are you working on?"
                className="flex-1 px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
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
                    <Pause className="w-4 h-4" />
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
              <button 
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                title="Toggle between Pomodoro or Stopwatch"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>

            {/* Task Display */}
            {currentTask && (
              <div className="mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white/90 text-sm text-center">{currentTask}</p>
              </div>
            )}

            {/* Session Type and Cycles */}
            <div className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg mb-4">
              <p className="text-white/80 text-sm text-center">
                {getSessionTypeLabel()} {completedCycles > 0 && `• ${completedCycles} cycles completed`}
              </p>
            </div>

            {/* Cycle Indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`w-2 h-2 rounded-full ${
                    num === 1 ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </main>

        {/* Bottom Bar */}
        <footer className="w-full px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBackgroundSettings(true)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Change background"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Rain sounds">
              <CloudRain className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Music">
              <Music className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Menu">
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Group study">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Chat">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Focus mode">
              <Zap className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Timer settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </footer>
      </div>

      {/* Modals */}
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

