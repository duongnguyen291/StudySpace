'use client'

import { ThemeToggle } from '../ThemeToggle'

/**
 * Global Header Component
 * Displays theme toggle button that appears on all pages
 * Fixed position in top-center
 */
export function GlobalHeader() {
  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <ThemeToggle />
    </header>
  )
}

