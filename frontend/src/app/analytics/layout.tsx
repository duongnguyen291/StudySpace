import { ReactNode } from 'react'
import { FeatureLayout } from '@/shared/components'

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return <FeatureLayout>{children}</FeatureLayout>
}
