'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '../ThemeToggle'
import { useAuth } from '@/shared/hooks/useAuth'
import { User } from 'lucide-react'

/**
 * Global Header Component
 * Displays theme toggle and user profile info
 * Fixed position in top-center
 */
export function GlobalHeader() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const getAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return null
    if (avatarUrl.startsWith('http')) return avatarUrl
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${apiUrl}${avatarUrl}`
  }

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <ThemeToggle />
    </header>
  )
}

