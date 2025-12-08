'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/shared/hooks/useTheme'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mounted } = useTheme()

  if (!mounted) {
    // Avoid hydration mismatch by waiting until theme is resolved on client
    return null
  }

  return <>{children}</>
}


