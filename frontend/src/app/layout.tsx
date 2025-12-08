import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider, GlobalHeader, Providers } from '@/shared/components'
import { AppShell } from './AppShell'
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
          <Providers>
            <GlobalHeader />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}