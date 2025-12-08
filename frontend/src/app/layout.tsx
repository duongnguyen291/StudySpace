import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider, GlobalHeader } from '@/shared/components'
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
      <body className={inter.className}>
        <ThemeProvider>
          <GlobalHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}