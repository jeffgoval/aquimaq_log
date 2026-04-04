import { cn } from '@/shared/lib/cn'
import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'gradient-cat text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity',
  secondary: 'bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 disabled:opacity-50 transition-colors',
  ghost: 'text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors',
  destructive: 'bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors',
  success: 'bg-green-600 text-white font-semibold hover:bg-green-500 disabled:opacity-50 transition-colors',
}

const sizeClasses: Record<ButtonSize, Record<ButtonVariant, string>> = {
  sm: {
    primary: 'px-3 py-1.5 text-xs rounded-lg',
    secondary: 'px-3 py-1.5 text-xs rounded-lg',
    ghost: 'text-xs',
    destructive: 'px-3 py-1.5 text-xs rounded-lg',
    success: 'px-3 py-1.5 text-xs rounded-lg',
  },
  md: {
    primary: 'px-4 py-2 text-sm rounded-lg',
    secondary: 'px-4 py-2 text-sm rounded-lg',
    ghost: 'text-sm',
    destructive: 'px-4 py-2 text-sm rounded-lg',
    success: 'px-4 py-2 text-sm rounded-lg',
  },
  lg: {
    primary: 'px-6 py-2.5 text-sm rounded-lg',
    secondary: 'px-6 py-2.5 text-sm rounded-lg',
    ghost: 'text-sm',
    destructive: 'px-6 py-2.5 text-sm rounded-lg',
    success: 'px-6 py-2.5 text-sm rounded-lg',
  },
}

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingText?: string
  children: ReactNode
}

export function AppButton({
  variant = 'primary',
  size = 'lg',
  loading = false,
  loadingText = 'Carregando...',
  disabled,
  className,
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(variantClasses[variant], sizeClasses[size][variant], className)}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  )
}
