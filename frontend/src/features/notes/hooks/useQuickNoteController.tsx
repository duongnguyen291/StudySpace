'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

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
