'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface QuickNoteContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const QuickNoteContext = createContext<QuickNoteContextValue | null>(null)

export const QuickNoteProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  // Global keyboard shortcut: Ctrl+Shift+N
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true')

      if (isInput) return

      if (e.ctrlKey && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault()
        open()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <QuickNoteContext.Provider value={{ isOpen, open, close }}>
      {children}
    </QuickNoteContext.Provider>
  )
}

export const useQuickNoteController = () => {
  const ctx = useContext(QuickNoteContext)
  if (!ctx) {
    throw new Error('useQuickNoteController must be used within QuickNoteProvider')
  }
  return ctx
}
