'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { YouTubeBackground } from '@/features/pomodoro/components/YouTubeBackground'
import { BackgroundSettings } from '@/features/pomodoro/components/BackgroundSettings'
import { QuoteBanner } from '@/features/quote'
import { useBackground } from '@/features/pomodoro/hooks/useBackground'
import { MusicWidget } from '@/features/pomodoro/components/MusicWidget'
import { TaskWidget } from '@/features/tasks/components/TaskWidget'
import { usePomodoroTimer } from '@/features/pomodoro/hooks/usePomodoroTimer'
import { Button } from '@/shared/components/Button'
import {
  LogOut,
  BarChart3,
  Video,
  Image as ImageIcon,
  CloudRain,
  Grid3x3,
  Zap,
  Pause,
  RotateCcw,
  Play,
  Droplets,
  Bird,
  Flame,
  Music,
  X,
  ChevronDown,
  Tag as TagIcon,
  Type // Import icon cho nút Font
} from 'lucide-react'

interface Tag {
  id: string
  name: string
  icon: string
  color: string
}

const DEFAULT_TAGS: Tag[] = [
  { id: '1', name: 'Học tập', icon: '📚', color: '#3B82F6' },
  { id: '2', name: 'Làm việc', icon: '💼', color: '#8B5CF6' },
  { id: '3', name: 'Đọc sách', icon: '📖', color: '#10B981' },
  { id: '4', name: 'Coding', icon: '💻', color: '#F59E0B' },
]

const QUICK_SUGGESTIONS = [
  { icon: '✍️', text: 'Viết báo cáo' },
  { icon: '💻', text: 'Code' },
  { icon: '🔎', text: 'Nghiên cứu' },
  { icon: '🎥', text: 'Học online' },
]

// Danh sách Font chữ Timer
const TIMER_FONTS = [
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Roboto Mono', value: "'Roboto Mono', monospace" },
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Playfair', value: "'Playfair Display', serif" },
]

// Danh sách Icon gợi ý cho bảng chọn
const ICON_PALETTE = [
  '📚', '💼', '💻', '🎨', '🎧', '🍎', 
  '⚽', '🎮', '🚀', '💡', '⏰', '📝',
  '🏠', '✈️', '🛒', '💊', '💤', '🌳'
]

export default function PomodoroPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { youtubeUrl, updateBackground } = useBackground()

  // --- Auth & Settings State ---
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false)
  
  // --- Task State ---
  const [currentTask, setCurrentTask] = useState('')
  
  // --- Custom Timer State ---
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customHours, setCustomHours] = useState(0)
  const [customMinutes, setCustomMinutes] = useState(25)

  // --- Display & Font State ---
  const [displayMode, setDisplayMode] = useState<'pomodoro' | 'clock'>('pomodoro')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timerFont, setTimerFont] = useState("'Montserrat', sans-serif") // Font mặc định
  const [showFontMenu, setShowFontMenu] = useState(false)
  const fontMenuRef = useRef<HTMLDivElement>(null)

  // --- Sound State ---
  const [showSoundMenu, setShowSoundMenu] = useState(false)
  const [showMusicWidget, setShowMusicWidget] = useState(false)
  const [musicWidgetSize, setMusicWidgetSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [selectedSound, setSelectedSound] = useState<'rain' | 'birds' | 'fire' | null>(null)
  const soundMenuRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // --- Tags State ---
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [newTag, setNewTag] = useState({ name: '', icon: '📚', color: '#3B82F6' })

  // --- Timer Hook ---
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

  // Effect: Clock Mode Tick
  useEffect(() => {
    if (displayMode === 'clock') {
      const timer = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [displayMode])

  // Effect: Close Menus on Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (soundMenuRef.current && !soundMenuRef.current.contains(event.target as Node)) {
        setShowSoundMenu(false)
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
        setShowFontMenu(false)
      }
    }
    if (showSoundMenu || showFontMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSoundMenu, showFontMenu])

  // Effect: Auto hide custom input when timer starts
  useEffect(() => {
    if (isActive) {
      setShowCustomInput(false)
    }
  }, [isActive])

  // Effect: Show custom input if session type is custom and not active
  useEffect(() => {
    if (!isActive && sessionType === 'custom_timer') {
      setShowCustomInput(true)
    }
  }, [isActive, sessionType])

  // Effect: Audio Player
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

  // --- Handlers ---
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
      setNewTag({ name: '', icon: '📚', color: '#3B82F6' })
      setShowNewTagForm(false)
    }
  }

  const handleQuickSuggestion = (text: string) => {
    setCurrentTask(text) 
  }

  const handleClearTask = () => {
    setCurrentTask('')
  }

  const handleClearTag = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTag('')
  }

  const currentTagObj = tags.find(tag => tag.id === selectedTag)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-white/70 animate-pulse">Loading StudySpace...</div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col font-sans text-slate-50 selection:bg-blue-500/30">
      {/* Import Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&family=Roboto+Mono:wght@400;700&family=Inter:wght@400;700;800&family=Playfair+Display:wght@400;700;800&display=swap');
      `}</style>

      <YouTubeBackground videoId={youtubeUrl} />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/40 pointer-events-none z-0" />

      <div className="relative z-10 flex-1 flex flex-col h-full">
        {/* === HEADER === */}
        <header className="w-full px-6 py-4 shrink-0 flex justify-between items-center z-20">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none tracking-tight">StudySpace</h1>
              <span className="text-[10px] text-white/60 uppercase tracking-widest">Focus Mode</span>
            </div>
          </div>
          
           <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="flex flex-col items-end mr-1">
                  <span className="text-sm font-medium text-white">{user?.username || 'User'}</span>
                  <span className="text-[10px] text-white/60">Level 1</span>
                </div>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="User" className="w-9 h-9 rounded-full border border-white/20" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowLogin(true)} className="bg-white/5 border-white/10 backdrop-blur-sm text-white hover:bg-white/10">
                  Đăng nhập
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowRegister(true)} className="bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10">
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className={`min-h-full w-full flex items-center py-8 px-4 gap-8 transition-all ${showMusicWidget ? 'justify-center' : 'justify-center'}`}>
            {/* Center: Timer, Controls & Quote */}
            <div className="w-full max-w-xl flex flex-col items-center gap-5">
              
              {displayMode === 'pomodoro' ? (
                <>
                  {/* 1. TAG SELECTOR */}
                  {!isActive && (
                    <div className="relative w-full max-w-xs z-30 group">
                       <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                          <TagIcon className="w-4 h-4" />
                        </div>
                        
                        <select
                          value={selectedTag}
                          onChange={(e) => e.target.value === 'add_new' ? setShowNewTagForm(true) : setSelectedTag(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10 rounded-full text-white text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-white/30 transition-all cursor-pointer shadow-sm"
                        >
                          <option value="" className="bg-gray-900 text-white/50">Chọn mục tiêu...</option>
                          {tags.map(tag => (
                            <option key={tag.id} value={tag.id} className="bg-gray-900">{tag.icon} {tag.name}</option>
                          ))}
                          <option value="add_new" className="bg-gray-900 font-semibold text-blue-400">➕ Thêm mới...</option>
                        </select>

                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                          <ChevronDown className="w-4 h-4" />
                        </div>

                        {selectedTag && (
                          <button
                            onClick={handleClearTag}
                            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all"
                            title="Bỏ chọn"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                       </div>

                       {/* New Tag Form */}
                       {showNewTagForm && (
                          <div className="absolute top-full left-0 mt-2 w-full p-4 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                             <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Tạo tag mới</h4>
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder="Tên tag..."
                                value={newTag.name}
                                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                              />
                              
                              <div>
                                <label className="text-[10px] text-white/50 mb-1 block">Chọn biểu tượng:</label>
                                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 pr-1">
                                  {ICON_PALETTE.map((icon) => (
                                    <button
                                      key={icon}
                                      onClick={() => setNewTag({...newTag, icon})}
                                      className={`aspect-square flex items-center justify-center rounded hover:bg-white/10 transition-colors ${newTag.icon === icon ? 'bg-blue-500/50 ring-1 ring-blue-400' : 'bg-white/5'}`}
                                    >
                                      {icon}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button variant="primary" size="sm" onClick={handleAddTag} className="flex-1 text-xs h-8">Lưu</Button>
                                <Button variant="outline" size="sm" onClick={() => setShowNewTagForm(false)} className="flex-1 text-xs h-8 bg-white/5 border-none text-white/70">Hủy</Button>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {isActive && currentTagObj && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/90 shadow-lg">
                        <span className="text-lg filter drop-shadow-md">{currentTagObj.icon}</span>
                        <span className="font-medium text-sm">{currentTagObj.name}</span>
                      </div>
                    </div>
                  )}

                  {/* 2. TIMER DISPLAY */}
                  <div className="flex flex-col items-center select-none">
                    <div 
                      className="text-9xl font-extrabold text-white drop-shadow-lg tracking-tight leading-none py-4 transition-all duration-300"
                      style={{ fontFamily: timerFont }} // Sử dụng state timerFont
                    >
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    {/* Session Label Pill */}
                    <div className="mt-2 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/5 shadow-inner">
                      <p className="text-white/80 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em]">
                        {getSessionTypeLabel()} {completedCycles > 0 && `• #${completedCycles}`}
                      </p>
                    </div>
                  </div>

                  {/* 3. TASK INPUT (Sửa lỗi: Nút X nằm ngoài khung) */}
                  <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!isActive ? (
                      <div className="relative group">
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={currentTask}
                            onChange={(e) => setCurrentTask(e.target.value)}
                            placeholder="Bạn đang tập trung làm gì?"
                            // Không cần pr lớn nữa vì nút X đã ra ngoài
                            className="w-full px-6 py-3 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/10 group-hover:border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 focus:bg-black/40 shadow-lg transition-all text-center text-base md:text-lg"
                          />
                          
                          {/* Nút X: Nằm ngoài khung bên phải */}
                          {currentTask && (
                            <button
                              onClick={handleClearTask}
                              className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all"
                              title="Xóa nội dung"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                          {QUICK_SUGGESTIONS.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickSuggestion(suggestion.text)}
                              className="px-3 py-1 bg-white/5 hover:bg-white/15 border border-white/5 rounded-full text-white/60 hover:text-white text-xs transition-all"
                            >
                              {suggestion.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      currentTask && (
                        <div className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl animate-in zoom-in duration-300 min-w-[280px]">
                          <span className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Đang tập trung</span>
                          <h3 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-md leading-tight">
                            {currentTask}
                          </h3>
                        </div>
                      )
                    )}
                  </div>

                  {/* 4. CONTROLS */}
                  <div className="flex items-center gap-4 pt-2">
                    {!isActive ? (
                      <Button
                        variant="primary"
                        onClick={handleStart}
                        className="h-12 md:h-14 px-8 md:px-10 bg-white hover:bg-slate-100 text-black rounded-2xl font-bold text-base md:text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300"
                      >
                        Bắt đầu
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handlePause}
                          className="h-12 px-6 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl backdrop-blur-md font-medium flex items-center gap-2 hover:scale-105 transition-all"
                        >
                          {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                          {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                        </Button>
                        <Button
                          onClick={handleReset}
                          className="h-12 w-12 p-0 flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white rounded-xl backdrop-blur-md transition-all"
                          title="Reset"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* 5. PRESETS & CUSTOM TIMER */}
                  {!isActive && (
                    <div className="flex items-center gap-6 pt-2 animate-in fade-in slide-in-from-bottom-2">
                      <PresetButton 
                        active={sessionType === 'work' && minutes === 25 && !showCustomInput} 
                        onClick={() => { setSessionType('work'); setMinutes(25); setSeconds(0); setShowCustomInput(false) }}
                        label="25'" tooltip="Làm việc"
                      />
                      <PresetButton 
                        active={sessionType === 'short_break' && minutes === 5 && !showCustomInput} 
                        onClick={() => { setSessionType('short_break'); setMinutes(5); setSeconds(0); setShowCustomInput(false) }}
                        label="5'" tooltip="Nghỉ ngắn"
                      />
                      <PresetButton 
                        active={sessionType === 'long_break' && minutes === 15 && !showCustomInput} 
                        onClick={() => { setSessionType('long_break'); setMinutes(15); setSeconds(0); setShowCustomInput(false) }}
                        label="15'" tooltip="Nghỉ dài"
                      />
                       <PresetButton 
                        active={sessionType === 'custom_timer'} 
                        onClick={() => { setSessionType('custom_timer'); setShowCustomInput(v => !v) }}
                        icon={<Grid3x3 className="w-3 h-3" />} tooltip="Tùy chỉnh"
                      />
                    </div>
                  )}

                  {/* Custom Input Panel */}
                  {!isActive && showCustomInput && (
                    <div className="mt-4 p-5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl animate-in zoom-in-95 shadow-2xl flex flex-col items-center gap-4 mb-4">
                      <div className="flex items-center gap-4 text-white">
                        <div className="flex flex-col items-center">
                          <input
                            type="number" min={0} max={12} value={customHours}
                            onChange={(e) => {
                              const h = Math.max(0, Number(e.target.value)); setCustomHours(h);
                              setMinutes(h * 60 + customMinutes); setSeconds(0);
                            }}
                            className="w-16 h-14 bg-white/10 rounded-xl text-center text-2xl font-bold focus:outline-none focus:bg-white/20 transition-all"
                          />
                          <span className="text-[10px] uppercase mt-1 text-white/50">Giờ</span>
                        </div>
                        <span className="text-2xl pb-4 opacity-50">:</span>
                        <div className="flex flex-col items-center">
                          <input
                            type="number" min={0} max={59} value={customMinutes}
                            onChange={(e) => {
                              const m = Math.min(59, Math.max(0, Number(e.target.value))); setCustomMinutes(m);
                              setMinutes(customHours * 60 + m); setSeconds(0);
                            }}
                            className="w-16 h-14 bg-white/10 rounded-xl text-center text-2xl font-bold focus:outline-none focus:bg-white/20 transition-all"
                          />
                          <span className="text-[10px] uppercase mt-1 text-white/50">Phút</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setShowCustomInput(false)} className="w-full bg-white text-black font-semibold h-8 text-xs">Xác nhận</Button>
                    </div>
                  )}
                </>
              ) : (
                // --- CLOCK MODE ---
                <div className="flex flex-col items-center justify-center animate-in fade-in duration-500 py-10">
                  <div className="text-[5rem] md:text-[8rem] font-bold text-white leading-none tracking-tight drop-shadow-xl select-none" style={{ fontFamily: timerFont }}>
                    {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="mt-6 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
                    <p className="text-white/80 text-xl font-medium tracking-wide">
                      {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Quote Banner - Always below Timer */}
              <div className="w-full max-w-2xl mt-6 opacity-80 hover:opacity-100 transition-opacity">
                <QuoteBanner />
              </div>
            </div>

            {/* Right Side: Music Widget (only when enabled) */}
            {showMusicWidget && (
              <div className={`hidden lg:block w-full animate-in fade-in slide-in-from-right-4 duration-500 transition-all ${
                musicWidgetSize === 'sm' ? 'max-w-sm' : 
                musicWidgetSize === 'md' ? 'max-w-md' : 
                'max-w-2xl'
              }`}>
                <div className="relative group">
                  {/* Size Control Buttons */}
                  <div className="absolute -top-8 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setMusicWidgetSize('sm')}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                        musicWidgetSize === 'sm' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                      }`}
                      title="Nhỏ"
                    >
                      S
                    </button>
                    <button
                      onClick={() => setMusicWidgetSize('md')}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                        musicWidgetSize === 'md' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                      }`}
                      title="Vừa"
                    >
                      M
                    </button>
                    <button
                      onClick={() => setMusicWidgetSize('lg')}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                        musicWidgetSize === 'lg' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                      }`}
                      title="Lớn"
                    >
                      L
                    </button>
                  </div>
                  <MusicWidget />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* === FOOTER === */}
        <footer className="w-full px-6 py-4 shrink-0 flex justify-between items-center z-20">
           <div className="flex items-center gap-2">
            <IconButton onClick={() => setShowBackgroundSettings(true)} icon={<ImageIcon className="w-5 h-5" />} tooltip="Hình nền" />
            
            <div className="relative" ref={soundMenuRef}>
              <IconButton 
                onClick={() => setShowSoundMenu(!showSoundMenu)} 
                active={!!selectedSound}
                icon={<CloudRain className="w-5 h-5" />} 
                tooltip="Âm thanh" 
              />
              {showSoundMenu && (
                <div className="absolute bottom-full left-0 mb-3 w-52 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2">
                  <SoundOption label="Mưa rơi" icon={Droplets} active={selectedSound === 'rain'} onClick={() => setSelectedSound(selectedSound === 'rain' ? null : 'rain')} color="text-blue-400" />
                  <SoundOption label="Chim hót" icon={Bird} active={selectedSound === 'birds'} onClick={() => setSelectedSound(selectedSound === 'birds' ? null : 'birds')} color="text-green-400" />
                  <SoundOption label="Lửa trại" icon={Flame} active={selectedSound === 'fire'} onClick={() => setSelectedSound(selectedSound === 'fire' ? null : 'fire')} color="text-orange-400" />
                </div>
              )}
            </div>

            <IconButton 
              onClick={() => setShowMusicWidget(!showMusicWidget)} 
              active={showMusicWidget}
              icon={<Music className="w-5 h-5" />} 
              tooltip="Music Player" 
            />
            
            {/* Nút Menu Grid */}
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Menu">
              <Grid3x3 className="w-5 h-5" />
            </button>

            {/* Thêm nút chọn Font chữ */}
            <div className="relative" ref={fontMenuRef}>
              <button 
                onClick={() => setShowFontMenu(!showFontMenu)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" 
                title="Kiểu chữ"
              >
                <Type className="w-5 h-5" />
              </button>
              
              {showFontMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-3 py-1 mb-2 border-b border-white/10">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Chọn font chữ</span>
                  </div>
                  {TIMER_FONTS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => { setTimerFont(font.value); setShowFontMenu(false); }}
                      className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${timerFont === font.value ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
              onClick={() => setDisplayMode('pomodoro')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${displayMode === 'pomodoro' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              <Zap className="w-3 h-3" /> Timer
            </button>
            <button
              onClick={() => setDisplayMode('clock')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${displayMode === 'clock' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              Clock
            </button>
          </div>
        </footer>
      </div>

      {/* Task Widget Popup */}
      <TaskWidget />

      {/* MODALS */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true) }} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true) }} />}
      {showBackgroundSettings && <BackgroundSettings currentUrl={youtubeUrl} onClose={() => setShowBackgroundSettings(false)} onSave={updateBackground} />}
    </div>
  )
}

// --- Sub-components ---

function PresetButton({ active, onClick, label, icon, tooltip }: any) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300
        ${active 
          ? 'bg-white border-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
          : 'bg-transparent border-white/20 text-white/60 hover:border-white/50 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {icon ? icon : <span className="text-xs font-bold">{label}</span>}
    </button>
  )
}

function IconButton({ onClick, icon, tooltip, active, className = '' }: any) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-3 rounded-xl transition-all border border-transparent ${active ? 'bg-white/20 text-white border-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'} ${className}`}
    >
      {icon}
    </button>
  )
}

function SoundOption({ label, icon: Icon, active, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
    >
      <Icon className={`w-4 h-4 ${active ? color : 'text-white/50'}`} />
      <span className={`text-sm font-medium ${active ? 'text-white' : 'text-white/70'}`}>{label}</span>
      {active && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />}
    </button>
  )
}