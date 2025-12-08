'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  Music,
  CheckSquare,
  TrendingUp,
  Award,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  Timer,
  Brain,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '@/shared/hooks/useAuth'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  description?: string
}

export function NavigationBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  // Danh sách các page feature
  const navItems: NavItem[] = [
    {
      label: 'Pomodoro',
      href: '/pomodoro',
      icon: <Timer className="w-5 h-5" />,
      description: 'Đồng hồ tập trung'
    },
    {
      label: 'Ghi chú',
      href: '/notes',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Ghi chú học tập'
    },
    {
      label: 'Âm nhạc',
      href: '/music',
      icon: <Music className="w-5 h-5" />,
      description: 'Nhạc học tập'
    },
    {
      label: 'Nhiệm vụ',
      href: '/tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      description: 'Quản lý nhiệm vụ'
    },
    {
      label: 'Tiến độ',
      href: '/progress',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Thống kê tiến độ'
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Phân tích học tập'
    },
    {
      label: 'Thành tích',
      href: '/achievements',
      icon: <Award className="w-5 h-5" />,
      description: 'Các huy chương'
    },
    {
      label: 'Quiz',
      href: '/quiz',
      icon: <Brain className="w-5 h-5" />,
      description: 'Trắc nghiệm'
    },
    {
      label: 'Chat AI',
      href: '/ai-chat',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Hỗ trợ AI'
    },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700/50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm">StudySpace</span>
            <span className="text-slate-400 text-xs">Learn Better</span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title={item.description}
            >
              <span className={`transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm flex-1">{item.label}</span>
              {active && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Bottom Section - Profile & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-transparent">
        <div className="space-y-2">
          <Link
            href="/profile"
            className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive('/profile')
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Hồ sơ</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-red-500/10 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Đăng xuất</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
