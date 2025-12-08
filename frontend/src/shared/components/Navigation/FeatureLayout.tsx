'use client'

import { NavigationBar } from '@/shared/components/Navigation'
import { ReactNode } from 'react'

interface FeatureLayoutProps {
  children: ReactNode
}

export function FeatureLayout({ children }: FeatureLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Main Content - shifted to right by sidebar width */}
      <main className="flex-1 ml-64">
        <div className="min-h-screen p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
