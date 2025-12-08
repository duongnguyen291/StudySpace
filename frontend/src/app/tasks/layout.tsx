import { ReactNode } from 'react'
import { FeatureLayout } from '@/shared/components/Navigation'

export default function FeaturePagesLayout({
  children,
}: {
  children: ReactNode
}) {
  return <FeatureLayout>{children}</FeatureLayout>
}
