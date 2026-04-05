import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface FormFieldShellProps {
  /** Omitir para campos só com título de secção (ex.: observações). */
  label?: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  htmlFor?: string
  children: ReactNode
}

export const FormFieldShell = ({
  label,
  required,
  error,
  hint,
  className,
  htmlFor,
  children,
}: FormFieldShellProps) => (
  <div className={cn(className)}>
    {label ? (
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {required ? ' *' : ''}
      </label>
    ) : null}
    {children}
    {error ? <span className="field-error">{error}</span> : null}
    {hint && !error ? <p className="field-hint">{hint}</p> : null}
  </div>
)
