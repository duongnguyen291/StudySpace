'use client'

import type { ReactNode } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { QuickNoteProvider } from '@/features/notes/hooks/useQuickNoteController'
import { QuickNoteFloatingButton } from '@/features/notes/components/QuickNoteFloatingButton'
import { QuickNotePopup } from '@/features/notes/components/QuickNotePopup'

interface Props {
  children: ReactNode
}

export const AppShell = ({ children }: Props) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // Khi chưa đăng nhập: không hiển thị quick note để tránh làm phiền
    return <>{children}</>
  }

  return (
    <QuickNoteProvider>
      {children}
      {/* Floating Quick Note button + popup */}
      <QuickNoteFloatingButton />
      <QuickNotePopup />
    </QuickNoteProvider>
  )
}
