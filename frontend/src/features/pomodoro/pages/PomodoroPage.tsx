'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { LoginModal } from '@/features/pomodoro/components/LoginModal'
import { RegisterModal } from '@/features/pomodoro/components/RegisterModal'
import { YouTubeBackground } from '@/features/pomodoro/components/YouTubeBackground'
import { BackgroundSettings } from '@/features/pomodoro/components/BackgroundSettings'
import { QuoteBanner } from '@/features/quote' 
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
  Zap,
  Pause,
  RotateCcw,
  Play,
  Droplets,
  Bird,
  Flame,
  Check
} from 'lucide-react'

interface Tag {
  id: string
  name: string
  icon: string
  color: string
}

const DEFAULT_TAGS: Tag[] = [
  { id: '1', name: 'Học', icon: '📚', color: '#3B82F6' },
  { id: '2', name: 'Làm việc', icon: '💼', color: '#8B5CF6' },
  { id: '3', name: 'Đọc sách', icon: '📖', color: '#10B981' },
  { id: '4', name: 'Coding', icon: '💻', color: '#F59E0B' },
]

const QUICK_SUGGESTIONS = [
  { icon: '✍️', text: 'Viết báo cáo' },
  { icon: '💻', text: 'Code' },
  { icon: '🔎', text: 'Đọc tài liệu' },
  { icon: '🎥', text: 'Học video' },
]

export default function PomodoroPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { youtubeUrl, updateBackground } = useBackground()

  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customHours, setCustomHours] = useState(0)
  const [customMinutes, setCustomMinutes] = useState(25)
  
  const [displayMode, setDisplayMode] = useState<'pomodoro' | 'clock'>('pomodoro')
  const [currentTime, setCurrentTime] = useState(new Date())

  const [showSoundMenu, setShowSoundMenu] = useState(false)
  const [selectedSound, setSelectedSound] = useState<'rain' | 'birds' | 'fire' | null>(null)
  const soundMenuRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [newTag, setNewTag] = useState({ name: '', icon: '', color: '#3B82F6' })

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

  useEffect(() => {
    if (displayMode === 'clock') {
      const timer = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [displayMode])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (soundMenuRef.current && !soundMenuRef.current.contains(event.target as Node)) {
        setShowSoundMenu(false)
      }
    }
    if (showSoundMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSoundMenu])

  useEffect(() => {
    if (isActive) {
      setShowCustomInput(false)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive && sessionType === 'custom_timer') {
      setShowCustomInput(true)
    }
  }, [isActive, sessionType])

  useEffect(() => {
    if (selectedSound) {
      const soundFiles = {
        rain: '/sounds/rain.mp3',
        birds: '/sounds/birds.mp3',
        fire: '/sounds/fire.mp3'
      }

      if (audioRef.current) {
        audioRef.current.pause()
      }

      audioRef.current = new Audio(soundFiles[selectedSound])
      audioRef.current.loop = true
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(err => {
        console.error('❌ Lỗi phát âm thanh:', err)
      })
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [selectedSound])

  const handleAddTag = () => {
    if (newTag.name && newTag.icon) {
      const tag: Tag = {
        id: Date.now().toString(),
        name: newTag.name,
        icon: newTag.icon,
        color: newTag.color
      }
      setTags([...tags, tag])
      setSelectedTag(tag.id)
      setNewTag({ name: '', icon: '', color: '#3B82F6' })
      setShowNewTagForm(false)
    }
  }

  const handleQuickSuggestion = (text: string) => {
    setCurrentTask(currentTask ? `${currentTask} • ${text}` : text)
  }

  const currentTagObj = tags.find(tag => tag.id === selectedTag)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-white/70">Loading...</div>
      </div>
    )
  }

  return (
    // SỬA ĐỔI: Sử dụng h-screen và overflow-hidden để khóa chiều cao, ngăn scroll
    <div className="relative h-screen w-full overflow-hidden flex flex-col">
      <YouTubeBackground videoId={youtubeUrl} />

      <div className="relative z-10 flex-1 flex flex-col h-full">
        {/* HEADER: Giữ gọn gàng */}
        <header className="w-full px-6 py-3 shrink-0 flex justify-between items-center gap-6 bg-black/25 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">StudySpace</h1>
            <span className="text-sm text-white/70">Learning</span>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
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

        {/* MAIN: Sử dụng flex-1 và justify-center để căn giữa theo chiều dọc */}
        {/* SỬA ĐỔI: py-12 -> py-2 để tiết kiệm diện tích */}
        <main className="flex-1 flex items-center justify-center px-6 py-2 overflow-y-auto">
          <div className="w-full max-w-2xl flex flex-col items-center">
            {displayMode === 'pomodoro' ? (
              <>
                {!isActive && (
                  // SỬA ĐỔI: mb-5 -> mb-4
                  <div className="mb-4 w-full"> 
                    <select
                      value={selectedTag}
                      onChange={(e) => {
                        if (e.target.value === 'add_new') {
                          setShowNewTagForm(true)
                        } else {
                          setSelectedTag(e.target.value)
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                    >
                      <option value="" className="bg-gray-900 text-white">Chọn tag</option>
                      {tags.map(tag => (
                        <option key={tag.id} value={tag.id} className="bg-gray-900 text-white">
                          {tag.icon} {tag.name}
                        </option>
                      ))}
                      <option value="add_new" className="bg-gray-900 text-white">➕ Thêm tag mới</option>
                    </select>

                    {showNewTagForm && (
                      <div className="mt-2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-white text-sm font-semibold mb-2">Tạo tag mới</h4>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Tên tag"
                            value={newTag.name}
                            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Icon"
                              value={newTag.icon}
                              onChange={(e) => setNewTag({ ...newTag, icon: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                            <input
                              type="color"
                              value={newTag.color}
                              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                              className="w-12 h-9 rounded cursor-pointer"
                            />
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleAddTag}
                              className="flex-1 bg-white text-gray-900 h-8 text-xs"
                            >
                              Lưu
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowNewTagForm(false)
                                setNewTag({ name: '', icon: '', color: '#3B82F6' })
                              }}
                              className="flex-1 bg-white/10 text-white h-8 text-xs"
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isActive && currentTagObj && (
                  <div className="mb-4 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                      <span className="text-lg">{currentTagObj.icon}</span>
                      <span className="text-white font-medium">{currentTagObj.name}</span>
                    </div>
                  </div>
                )}

                {/* --- ĐỒNG HỒ TIMER --- */}
                {/* SỬA ĐỔI: text-9xl -> responsive text-7xl -> 9xl để vừa màn hình nhỏ */}
                <div className="mb-0 flex items-center justify-center"> 
                  <div className="text-7xl md:text-8xl lg:text-9xl font-extrabold text-white drop-shadow-2xl tracking-tight transition-all" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                </div>

                {/* --- QUOTE BANNER --- */}
                {/* SỬA ĐỔI: mb-2 để gần đồng hồ, margin px-4 */}
                <div className="mb-4 w-full px-4">
                  <QuoteBanner />
                </div>

                {!isActive && (
                  <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-3">
                      <input
                        type="text"
                        value={currentTask}
                        onChange={(e) => setCurrentTask(e.target.value)}
                        placeholder="Bạn đang làm gì?"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 shadow-lg"
                      />
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {QUICK_SUGGESTIONS.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSuggestion(suggestion.text)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-full text-white/80 text-xs transition-colors flex items-center gap-1"
                        >
                          <span>{suggestion.icon}</span>
                          <span>{suggestion.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isActive && currentTask && (
                  <div className="mb-6 flex justify-center animate-in zoom-in duration-300">
                    <div className="inline-block px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                      <p className="text-white/90 text-lg font-medium">{currentTask}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3 mb-6">
                  {!isActive ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleStart}
                      className="px-10 py-3 bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all"
                    >
                      Start Focus
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePause}
                        className="px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold flex items-center gap-2 backdrop-blur-sm"
                      >
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleReset}
                        className="px-8 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold flex items-center gap-2 backdrop-blur-sm"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex justify-center mb-4">
                  <div className="inline-block px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full border border-white/5">
                    <p className="text-white/70 text-xs font-medium text-center uppercase tracking-wider">
                      {getSessionTypeLabel()} {completedCycles > 0 && `• Cycle ${completedCycles}`}
                    </p>
                  </div>
                </div>

                {!isActive && (
                  <div className="flex justify-center gap-5 mb-2">
                    <button
                      type="button"
                      onClick={() => { setSessionType('work'); setMinutes(25); setSeconds(0); setShowCustomInput(false) }}
                      className={`w-3 h-3 rounded-full ${sessionType === 'work' && minutes === 25 && !showCustomInput ? 'bg-white scale-150 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/30 hover:bg-white/60'} transition-all duration-300`}
                      title="25 phút - Làm việc"
                    />
                    <button
                      type="button"
                      onClick={() => { setSessionType('short_break'); setMinutes(5); setSeconds(0); setShowCustomInput(false) }}
                      className={`w-3 h-3 rounded-full ${sessionType === 'short_break' && minutes === 5 && !showCustomInput ? 'bg-white scale-150 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/30 hover:bg-white/60'} transition-all duration-300`}
                      title="5 phút - Nghỉ ngắn"
                    />
                    <button
                      type="button"
                      onClick={() => { setSessionType('long_break'); setMinutes(15); setSeconds(0); setShowCustomInput(false) }}
                      className={`w-3 h-3 rounded-full ${sessionType === 'long_break' && minutes === 15 && !showCustomInput ? 'bg-white scale-150 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/30 hover:bg-white/60'} transition-all duration-300`}
                      title="15 phút - Nghỉ dài"
                    />
                    <button
                      type="button"
                      onClick={() => { setSessionType('custom_timer'); setShowCustomInput(v => !v) }}
                      className={`w-3 h-3 rounded-full ${sessionType === 'custom_timer' ? 'bg-white scale-150 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/30 hover:bg-white/60'} transition-all duration-300`}
                      title="Tùy chỉnh"
                    />
                  </div>
                )}

                {!isActive && showCustomInput && (
                  <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/10">
                      {/* ... (Giữ nguyên logic input custom) ... */}
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min={0} max={12}
                          value={customHours}
                          onChange={(e) => {
                            const h = Math.min(12, Math.max(0, Number(e.target.value))); setCustomHours(h);
                            setMinutes(h * 60 + customMinutes); setSeconds(0);
                          }}
                          className="w-12 px-1 py-1 rounded bg-white/10 text-white text-center text-sm focus:outline-none"
                        />
                        <span className="text-[10px] text-white/50 mt-1">Giờ</span>
                      </div>
                      <span className="text-white/50">:</span>
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min={0} max={59}
                          value={customMinutes}
                          onChange={(e) => {
                            const m = Math.min(59, Math.max(0, Number(e.target.value))); setCustomMinutes(m);
                            setMinutes(customHours * 60 + m); setSeconds(0);
                          }}
                          className="w-12 px-1 py-1 rounded bg-white/10 text-white text-center text-sm focus:outline-none"
                        />
                         <span className="text-[10px] text-white/50 mt-1">Phút</span>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => setShowCustomInput(false)} className="h-8 text-xs bg-white text-black">OK</Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // CLOCK MODE
              <div className="flex flex-col items-center justify-center h-full">
                <div className="mb-4">
                  <div className="text-8xl md:text-9xl font-extrabold text-white drop-shadow-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
                <div className="px-6 py-3 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10">
                  <p className="text-white/90 text-xl font-medium">
                    {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* FOOTER: Shrink-0 để không bị co lại */}
        <footer className="w-full px-6 py-3 shrink-0 flex justify-between items-center bg-black/25 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBackgroundSettings(true)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Đổi nền"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={soundMenuRef}>
              <button
                onClick={() => setShowSoundMenu(!showSoundMenu)}
                className={`p-2 ${selectedSound ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'} rounded-lg transition-colors`}
                title="Âm thanh"
              >
                <CloudRain className="w-5 h-5" />
              </button>

              {showSoundMenu && (
                <div className="absolute bottom-full left-0 mb-4 w-48 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                   {/* Sound Options ... */}
                  <button
                    onClick={() => { setSelectedSound(selectedSound === 'rain' ? null : 'rain'); setShowSoundMenu(false) }}
                    className={`w-full px-4 py-3 flex items-center gap-3 ${selectedSound === 'rain' ? 'text-blue-400 bg-white/5' : 'text-gray-300 hover:bg-white/5'} transition-colors`}
                  >
                    <Droplets className="w-4 h-4" /> <span className="text-sm font-medium">Mưa rơi</span>
                  </button>
                  <button
                    onClick={() => { setSelectedSound(selectedSound === 'birds' ? null : 'birds'); setShowSoundMenu(false) }}
                    className={`w-full px-4 py-3 flex items-center gap-3 ${selectedSound === 'birds' ? 'text-green-400 bg-white/5' : 'text-gray-300 hover:bg-white/5'} transition-colors`}
                  >
                    <Bird className="w-4 h-4" /> <span className="text-sm font-medium">Chim hót</span>
                  </button>
                  <button
                    onClick={() => { setSelectedSound(selectedSound === 'fire' ? null : 'fire'); setShowSoundMenu(false) }}
                    className={`w-full px-4 py-3 flex items-center gap-3 ${selectedSound === 'fire' ? 'text-orange-400 bg-white/5' : 'text-gray-300 hover:bg-white/5'} transition-colors`}
                  >
                    <Flame className="w-4 h-4" /> <span className="text-sm font-medium">Lửa cháy</span>
                  </button>
                </div>
              )}
            </div>

            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Music className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setDisplayMode('pomodoro')}
              className={`p-1.5 rounded-md transition-all ${displayMode === 'pomodoro' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayMode('clock')}
              className={`p-1.5 rounded-md transition-all ${displayMode === 'clock' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>
        </footer>
      </div>

      {/* MODALS giữ nguyên */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true) }} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true) }} />}
      {showBackgroundSettings && <BackgroundSettings currentUrl={youtubeUrl} onClose={() => setShowBackgroundSettings(false)} onSave={updateBackground} />}
    </div>
  )
}