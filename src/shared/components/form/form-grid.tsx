import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const columnsClass: Record<1 | 2 | 3, string> = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
}

export interface FormGridProps {
  columns?: 1 | 2 | 3
  className?: string
  children: ReactNode
}

export const FormGrid = ({ columns = 2, className, children }: FormGridProps) => (
  <div className={cn('grid grid-cols-1 gap-3 sm:gap-4', columns > 1 && columnsClass[columns], className)}>
    {children}
  </div>
)
