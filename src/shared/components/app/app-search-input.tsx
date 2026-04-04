import { Search } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface AppSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
}

export function AppSearchInput({ containerClassName, className, ...props }: AppSearchInputProps) {
  return (
    <div className={cn('relative w-full max-w-sm', containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0" />
      <input
        {...props}
        className={cn(
          'w-full rounded-lg border border-input bg-input pl-9 pr-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all',
          className
        )}
      />
    </div>
  )
}
