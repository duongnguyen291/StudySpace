'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/shared/hooks/useTheme'
import { Button } from '../Button'

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={toggleTheme}
      className="border-gray-300 text-black hover:bg-gray-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 flex items-center gap-3 px-8 py-3 min-w-[140px] justify-center"
      aria-label="Chuyển chế độ giao diện"
    >
      {theme === 'dark' ? (
        <>
          <Moon className="w-5 h-5" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-5 h-5" />
          <span>Light</span>
        </>
      )}
    </Button>
  )
}

