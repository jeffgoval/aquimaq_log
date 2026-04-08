import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface AppCardProps {
  children: ReactNode
  className?: string
}

export const AppCard = ({ children, className }: AppCardProps) => (
  <div className={cn('rounded-xl border border-border bg-card p-4 sm:p-5', className)}>{children}</div>
)

