import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// ...existing code...
import { QuoteBanner } from '@/features/quote'
// ...existing code...


// ...existing code...


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudySpace - Personal Learning Platform',
  description: 'Nền tảng học tập cá nhân thông minh',
}



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <QuoteBanner />
        <div className="pt-0">{children}</div>
      </body>
    </html>
  )
}