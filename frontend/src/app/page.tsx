'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/Button'
import { useAuth } from '@/shared/hooks/useAuth'
import { LoginModal } from '@/features/pomodoro/components/LoginModal'
import { RegisterModal } from '@/features/pomodoro/components/RegisterModal'
import { QuoteBanner } from '@/features/quote'
import { 
  Timer, 
  BookOpen, 
  Brain, 
  Bot, 
  Target, 
  Music, 
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PlayCircle,
  LogOut
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const features = [
    {
      icon: Timer,
      title: 'Pomodoro Timer',
      description: 'Bộ đếm giờ thông minh giúp bạn tập trung học tập hiệu quả với chu kỳ 25-5 phút, có thể tùy chỉnh theo nhu cầu.',
      color: 'text-blue-400'
    },
    {
      icon: BookOpen,
      title: 'Ghi chú & Quản lý công việc',
      description: 'Hệ thống ghi chú thông minh với tag và phân loại, cùng Todo List để quản lý công việc học tập một cách có hệ thống.',
      color: 'text-green-400'
    },
    {
      icon: Brain,
      title: 'Quiz & Flashcards',
      description: 'Tạo quiz và bộ thẻ học với thuật toán spaced repetition, giúp bạn ghi nhớ kiến thức lâu dài và hiệu quả.',
      color: 'text-purple-400'
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Trợ lý AI thông minh giúp giải đáp thắc mắc, giải thích khái niệm và đề xuất phương pháp học tập phù hợp.',
      color: 'text-pink-400'
    },
    {
      icon: Target,
      title: 'Mục tiêu hàng ngày',
      description: 'Đặt mục tiêu học tập mỗi ngày và theo dõi tiến độ hoàn thành để duy trì động lực học tập.',
      color: 'text-orange-400'
    },
    {
      icon: Music,
      title: 'Nhạc nền học tập',
      description: 'Chọn nhạc lofi, piano, tiếng mưa hoặc YouTube video làm nền để tạo không gian học tập tập trung.',
      color: 'text-cyan-400'
    },
    {
      icon: TrendingUp,
      title: 'Theo dõi tiến độ',
      description: 'Biểu đồ và thống kê chi tiết giúp bạn theo dõi tiến độ học tập, nhận huy hiệu thành tích và cải thiện hiệu quả.',
      color: 'text-yellow-400'
    },
    {
      icon: Sparkles,
      title: 'Câu nói truyền cảm hứng',
      description: 'Nhận câu nói truyền cảm hứng mỗi ngày để duy trì động lực và tinh thần học tập tích cực.',
      color: 'text-indigo-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-4 flex justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">StudySpace</h1>
        </div>

        {/* Quote Banner ở giữa */}
        <div className="flex-1 flex justify-center">
          <QuoteBanner />
        </div>

        <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
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
                <span className="text-sm text-gray-300 hidden sm:inline">{user?.username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/pomodoro')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Mở ứng dụng
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/login')}
                className="border-white/20 text-white hover:bg-white/10"
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/pomodoro')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Mở ứng dụng
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ...existing code... Hero, Features, CTA, Footer giữ nguyên */}
      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        {/* ...existing code... */}
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        {/* ...existing code... */}
      </section>

      {/* Simple Timer Modes Section */}
      <section className="relative z-10 px-6 py-20 bg-gray-900/50">
        {/* ...existing code... */}
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        {/* ...existing code... */}
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-gray-900/80 border-t border-gray-800">
        {/* ...existing code... */}
      </footer>

    </div>
  )
}