'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/Button'
import { useAuth } from '@/shared/hooks/useAuth'
import { LoginModal } from '@/features/pomodoro/components/LoginModal'
import { RegisterModal } from '@/features/pomodoro/components/RegisterModal'
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
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

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
      <header className="relative z-10 w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">StudySpace</h1>
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
                onClick={() => setShowLogin(true)}
                className="border-white/20 text-white hover:bg-white/10"
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

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full mb-6 border border-gray-700/50">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-gray-300">Đang giúp hàng nghìn sinh viên tập trung học tập</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Không gian học tập của bạn
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            StudySpace giúp bạn học tập hiệu quả hơn, chặn các phiền nhiễu, quản lý thời gian và duy trì trạng thái tập trung.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/pomodoro')}
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg flex items-center gap-2 group"
            >
              Bắt đầu phiên học tập
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const featuresSection = document.getElementById('features')
                featuresSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
            >
              Xem cách hoạt động
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-gray-400">
            Bắt đầu học tập ngay hôm nay. Miễn phí, không cần thẻ tín dụng.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm text-gray-400 mb-4">Được xây dựng để giúp bạn học tập nhiều hơn, đạt được nhiều hơn</p>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Được thiết kế cho sự tập trung sâu</h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Các công cụ được suy nghĩ kỹ lưỡng giúp bạn tập trung vào nhiệm vụ, xây dựng động lực và theo dõi tiến độ – mà không làm gián đoạn.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all hover:transform hover:scale-105"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Simple Timer Modes Section */}
      <section className="relative z-10 px-6 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center mb-6">
                <Timer className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-4xl font-bold mb-4">Chế độ đếm giờ đơn giản</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Chọn Pomodoro (25/5), đếm giờ tùy chỉnh, hoặc Stopwatch. Chuyển đổi chế độ để phù hợp với nhiệm vụ của bạn.
              </p>
            </div>

            {/* Right: Visual Demo */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex gap-2 border-b border-gray-700 pb-4">
                    <div className="px-4 py-2 bg-gray-700 rounded-lg flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm">Focus Timer</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors">
                      <PlayCircle className="w-4 h-4" />
                      <span className="text-sm">Stopwatch</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Chọn Preset</p>
                    <div className="space-y-2">
                      {[
                        'Classic Pomodoro 25m - 5m - 15m',
                        'Extended Focus 50m - 10m - 30m',
                        'Quick Sessions 10m',
                        'Deep Work 90m - 15m - 45m'
                      ].map((preset, i) => (
                        <div
                          key={i}
                          className="px-4 py-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors text-sm"
                        >
                          {preset}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-5xl font-bold mb-6">Sẵn sàng tập trung?</h3>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/pomodoro')}
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-4 text-lg flex items-center gap-2 mx-auto group"
          >
            Bắt đầu phiên học tập
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm text-gray-400 mt-6">
            Bắt đầu học tập ngay hôm nay. Miễn phí, không cần thẻ tín dụng.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-gray-900/80 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-lg font-bold">StudySpace</h4>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Không gian học tập giúp sinh viên học tập nhiều hơn và đạt được nhiều hơn.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h5 className="font-semibold mb-4">Sản phẩm</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/pomodoro" className="hover:text-white transition-colors">Tính năng</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Pomodoro Timer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ghi chú & Tasks</a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h5 className="font-semibold mb-4">Hỗ trợ</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h5 className="font-semibold mb-4">Pháp lý</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              © 2025 StudySpace. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>

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
    </div>
  )
}
