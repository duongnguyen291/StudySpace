/**
 * Theme Hook
 * Manages dark/light theme
 */
import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const setLightTheme = () => {
    setTheme('light')
    applyTheme('light')
  }

  const setDarkTheme = () => {
    setTheme('dark')
    applyTheme('dark')
  }

  return {
    theme,
    mounted,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  }
}

