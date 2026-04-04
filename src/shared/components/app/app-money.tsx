import { cn } from '@/shared/lib/cn'
import { currency } from '@/shared/lib/currency'

interface AppMoneyProps {
  value: number
  className?: string
  colored?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AppMoney({ value, className, colored, size = 'md' }: AppMoneyProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-bold',
  }

  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        sizeClasses[size],
        colored && value >= 0 ? 'text-green-400' : colored ? 'text-red-400' : '',
        className
      )}
    >
      {currency.format(value)}
    </span>
  )
}
