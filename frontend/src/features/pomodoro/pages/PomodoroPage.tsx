'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { YouTubeBackground } from '@/features/pomodoro/components/YouTubeBackground'
import { BackgroundSettings } from '@/features/pomodoro/components/BackgroundSettings'
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
  Music,
  CloudRain,
  Grid3x3,
  Users,
  MessageCircle,
  Zap,
  Pause,
  RotateCcw,
  Play,
  Droplets,
  Bird,
  Flame,
  Plus,
  BookOpen,
  Code,
  FileText,
  PlayCircle,
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
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { youtubeUrl, updateBackground } = useBackground()
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customHours, setCustomHours] = useState(0)
  const [customMinutes, setCustomMinutes] = useState(25)
  
  // State cho chế độ hiển thị
  const [displayMode, setDisplayMode] = useState<'pomodoro' | 'clock'>('pomodoro')
  const [currentTime, setCurrentTime] = useState(new Date())

  // State cho menu âm thanh
  const [showSoundMenu, setShowSoundMenu] = useState(false)
  const [showMusicWidget, setShowMusicWidget] = useState(false)
  const [selectedSound, setSelectedSound] = useState<'rain' | 'birds' | 'fire' | null>(null)
  const soundMenuRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // State cho Tags
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

  // Cập nhật đồng hồ
  useEffect(() => {
    if (displayMode === 'clock') {
      const timer = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [displayMode])

  // Đóng menu khi click bên ngoài
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

  // Ẩn custom input khi start
  useEffect(() => {
    if (isActive) {
      setShowCustomInput(false)
    }
  }, [isActive])

  // Hiện custom input khi reset và đang ở chế độ custom
  useEffect(() => {
    if (!isActive && sessionType === 'custom_timer') {
      setShowCustomInput(true)
    }
  }, [isActive, sessionType])

  // Quản lý phát âm thanh
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

  // Handle thêm tag mới
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

  // Handle quick suggestion
  const handleQuickSuggestion = (text: string) => {
    setCurrentTask(currentTask ? `${currentTask} • ${text}` : text)
  }

  // Lấy tag hiện tại
  const currentTagObj = tags.find(tag => tag.id === selectedTag)

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
                  onClick={() => router.push('/login')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/register')}
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
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,2.2fr)] gap-8">
            {/* Khu vực Pomodoro chính */}
            <div className={`w-full ${showMusicWidget ? '' : 'lg:col-span-2 flex justify-center'}`}>
              <div className={showMusicWidget ? '' : 'w-full max-w-2xl'}>
                {displayMode === 'pomodoro' ? (
                  <>
                {/* Tag selector - chỉ hiển thị khi chưa start */}
                {!isActive && (
                  <div className="mb-5">
                    <select
                      value={selectedTag}
                      onChange={(e) => {
                        if (e.target.value === 'add_new') {
                          setShowNewTagForm(true)
                        } else {
                          setSelectedTag(e.target.value)
                        }
                      }}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                    >
                      <option value="" className="bg-gray-900 text-white">Chọn tag</option>
                      {tags.map(tag => (
                        <option key={tag.id} value={tag.id} className="bg-gray-900 text-white">
                          {tag.icon} {tag.name}
                        </option>
                      ))}
                      <option value="add_new" className="bg-gray-900 text-white">➕ Thêm tag mới</option>
                    </select>

                    {/* Form thêm tag mới */}
                    {showNewTagForm && (
                      <div className="mt-3 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                        <h4 className="text-white font-semibold mb-3">Tạo tag mới</h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Tên tag"
                            value={newTag.name}
                            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                          />
                          <input
                            type="text"
                            placeholder="Icon (emoji)"
                            value={newTag.icon}
                            onChange={(e) => setNewTag({ ...newTag, icon: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                          />
                          <div className="flex items-center gap-2">
                            <label className="text-white/70 text-sm">Màu:</label>
                            <input
                              type="color"
                              value={newTag.color}
                              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                              className="w-16 h-10 rounded cursor-pointer"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleAddTag}
                              className="flex-1 bg-white text-gray-900 hover:bg-white/90"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Lưu
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowNewTagForm(false)
                                setNewTag({ name: '', icon: '', color: '#3B82F6' })
                              }}
                              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hiển thị tag đã chọn khi đang chạy - căn giữa */}
                {isActive && currentTagObj && (
                  <div className="mb-5 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                      <span className="text-lg">{currentTagObj.icon}</span>
                      <span className="text-white font-medium">{currentTagObj.name}</span>
                    </div>
                  </div>
                )}

                {/* Timer display - ĐỔI FONT THÀNH MONTSERRAT EXTRABOLD */}
                <div className="mb-8 flex items-center justify-center">
                  <div className="text-9xl font-extrabold text-white drop-shadow-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                </div>

                {/* Task input - chỉ hiển thị khi chưa start */}
                {!isActive && (
                  <>
                    <div className="mb-3">
                      <input
                        type="text"
                        value={currentTask}
                        onChange={(e) => setCurrentTask(e.target.value)}
                        placeholder="Bạn đang làm gì?"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                      />
                    </div>

                    {/* Quick suggestions */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {QUICK_SUGGESTIONS.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSuggestion(suggestion.text)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm transition-colors flex items-center gap-1"
                        >
                          <span>{suggestion.icon}</span>
                          <span>{suggestion.text}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Hiển thị task khi đang chạy - căn giữa */}
                {isActive && currentTask && (
                  <div className="mb-5 flex justify-center">
                    <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                      <p className="text-white/90 text-base">{currentTask}</p>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-3 mb-4">
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
                    <>
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
                    </>
                  )}
                </div>

                {/* Session label - căn giữa và thu gọn */}
                <div className="flex justify-center mb-4">
                  <div className="inline-block px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg">
                    <p className="text-white/80 text-sm text-center">
                      {getSessionTypeLabel()} {completedCycles > 0 && `• Hoàn thành ${completedCycles} phiên`}
                    </p>
                  </div>
                </div>

                {/* Preset dots - CHỈ HIỂN THỊ KHI CHƯA START */}
                {!isActive && (
                  <div className="flex justify-center gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setSessionType('work')
                        setMinutes(25)
                        setSeconds(0)
                        setShowCustomInput(false)
                      }}
                      className={`w-4 h-4 rounded-full ${sessionType === 'work' && minutes === 25 && !showCustomInput ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'} transition-all`}
                      title="25 phút - Làm việc"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSessionType('short_break')
                        setMinutes(5)
                        setSeconds(0)
                        setShowCustomInput(false)
                      }}
                      className={`w-4 h-4 rounded-full ${sessionType === 'short_break' && minutes === 5 && !showCustomInput ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'} transition-all`}
                      title="5 phút - Nghỉ ngắn"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSessionType('long_break')
                        setMinutes(15)
                        setSeconds(0)
                        setShowCustomInput(false)
                      }}
                      className={`w-4 h-4 rounded-full ${sessionType === 'long_break' && minutes === 15 && !showCustomInput ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'} transition-all`}
                      title="15 phút - Nghỉ dài"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSessionType('custom_timer')
                        setShowCustomInput(v => !v)
                      }}
                      className={`w-4 h-4 rounded-full ${sessionType === 'custom_timer' ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'} transition-all`}
                      title="Tùy chỉnh thời gian"
                    />
                  </div>
                )}

                {/* Custom time panel - CHỈ HIỂN THỊ KHI CHƯA START */}
                {!isActive && showCustomInput && (
                  <div className="flex flex-col items-center gap-5 mb-10">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-white/70 mb-1">Giờ</label>
                        <input
                          type="number"
                          min={0}
                          max={12}
                          value={customHours}
                          onChange={(e) => {
                            const hours = Math.min(12, Math.max(0, Number(e.target.value)))
                            setCustomHours(hours)
                            // Cập nhật timer ngay lập tức
                            const totalMinutes = hours * 60 + customMinutes
                            setMinutes(totalMinutes)
                            setSeconds(0)
                          }}
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
                          onChange={(e) => {
                            const mins = Math.min(59, Math.max(0, Number(e.target.value)))
                            setCustomMinutes(mins)
                            // Cập nhật timer ngay lập tức
                            const totalMinutes = customHours * 60 + mins
                            setMinutes(totalMinutes)
                            setSeconds(0)
                          }}
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
                          setMinutes(25)
                          setSeconds(0)
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
                          setShowCustomInput(false)
                        }}
                        className="px-4 py-2 bg-white text-gray-900 hover:bg-white/90 font-semibold"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-8">
                  <div
                    className="text-9xl font-extrabold text-white drop-shadow-lg"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {currentTime.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
                <div className="px-6 py-3 bg-black/30 backdrop-blur-sm rounded-lg">
                  <p className="text-white/80 text-lg">
                    {currentTime.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
              </div>
            </div>

            {/* Music Playlist widget - luôn được mount, chỉ ẩn/hiện bằng CSS để không ngắt nhạc */}
            <div className={`lg:self-stretch ${showMusicWidget ? 'block' : 'hidden'}`}>
              <MusicWidget />
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="w-full px-6 py-4 flex justify-between items-center bg-black/25 backdrop-blur-sm">
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
                title="Âm thanh môi trường"
              >
                <CloudRain className="w-5 h-5" />
              </button>

              {showSoundMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setSelectedSound(selectedSound === 'rain' ? null : 'rain')
                      setShowSoundMenu(false)
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 ${selectedSound === 'rain' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
                  >
                    <Droplets className="w-5 h-5" />
                    <span className="font-medium">Mưa rơi</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSound(selectedSound === 'birds' ? null : 'birds')
                      setShowSoundMenu(false)
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 ${selectedSound === 'birds' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
                  >
                    <Bird className="w-5 h-5" />
                    <span className="font-medium">Chim hót</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSound(selectedSound === 'fire' ? null : 'fire')
                      setShowSoundMenu(false)
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 ${selectedSound === 'fire' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors`}
                  >
                    <Flame className="w-5 h-5" />
                    <span className="font-medium">Lửa cháy</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMusicWidget((v) => !v)}
              className={`p-2 rounded-lg transition-colors ${
                showMusicWidget
                  ? 'text-white bg-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Nhạc nền học tập"
            >
              <Music className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Menu">
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDisplayMode('pomodoro')}
              className={`p-2 ${displayMode === 'pomodoro' ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'} rounded-lg transition-colors`}
              title="Chế độ Pomodoro"
            >
              <Zap className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDisplayMode('clock')}
              className={`p-2 ${displayMode === 'clock' ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'} rounded-lg transition-colors`}
              title="Đồng hồ thời gian thực"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </footer>
      </div>

      {showBackgroundSettings && (
        <BackgroundSettings
          currentUrl={youtubeUrl}
          onClose={() => setShowBackgroundSettings(false)}
          onSave={updateBackground}
        />
      )}

      {/* Task Widget - Floating button + popup */}
      <TaskWidget />
    </div>
  )
}