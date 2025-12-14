'use client'

import { PenLine } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useQuickNoteController } from '../hooks/useQuickNoteController'

export const QuickNoteFloatingButton = () => {
  const { open } = useQuickNoteController()
  const pathname = usePathname()
  
  // Trên trang pomodoro, đặt button ở bên trái dưới task widget
  const isPomodoroPage = pathname === '/pomodoro'
  
  if (isPomodoroPage) {
    // Style glassmorphism giống task widget, đặt dưới task button
    return (
      <button
        type="button"
        onClick={open}
        className="
          fixed left-6 top-1/2 translate-y-[60px] z-40
          p-3.5 rounded-2xl
          backdrop-blur-md border shadow-lg
          bg-white/15 border-white/25 text-white/80 
          hover:bg-white/20 hover:text-white hover:scale-105
          transition-all duration-300 ease-out
        "
        aria-label="Mở ghi chú nhanh"
      >
        <PenLine className="w-5 h-5" />
      </button>
    )
  }
  
  // Trên các trang khác, giữ nguyên vị trí góc dưới bên phải
  return (
    <button
      type="button"
      onClick={open}
      className="fixed bottom-4 right-4 z-30 rounded-full w-12 h-12 bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
      aria-label="Mở ghi chú nhanh"
    >
      <PenLine className="w-5 h-5" />
    </button>
  )
}
