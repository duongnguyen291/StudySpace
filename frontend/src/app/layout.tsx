import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppShell } from './AppShell'
import { Providers } from '@/shared/components'
// Import axios HTTPS patch early
import '@/lib/axios-https-patch'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudySpace - Personal Learning Platform',
  description: 'Nền tảng học tập cá nhân thông minh',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}