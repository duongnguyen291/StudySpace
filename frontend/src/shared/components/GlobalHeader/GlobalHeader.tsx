'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '../ThemeToggle'
import { useAuth } from '@/shared/hooks/useAuth'
import { User } from 'lucide-react'

/**
 * Global Header Component
 * Displays theme toggle and user profile info
 * Fixed position in top-center
 * Hidden on all pages (no longer needed)
 */
export function GlobalHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  // Hide GlobalHeader on all pages
  return null
}

