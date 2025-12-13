'use client'

import { PenLine } from 'lucide-react'
import { useQuickNoteController } from '../hooks/useQuickNoteController'

export const QuickNoteFloatingButton = () => {
  const { open } = useQuickNoteController()

  return (
    <button
      type="button"
      onClick={open}
      className="fixed bottom-4 right-4 z-30 rounded-full w-12 h-12 bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label="Mở ghi chú nhanh"
    >
      <PenLine className="w-5 h-5" />
    </button>
  )
}
