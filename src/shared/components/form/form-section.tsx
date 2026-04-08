import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface FormSectionProps {
  title: string
  className?: string
  children: ReactNode
}

export const FormSection = ({ title, className, children }: FormSectionProps) => (
  <div className={cn('rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3', className)}>
    <h2 className="typo-section-title">{title}</h2>
    {children}
  </div>
)
