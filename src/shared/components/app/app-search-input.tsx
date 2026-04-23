import type { ChangeEvent, InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface AppSearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
}

function hasClearableValue(value: InputHTMLAttributes<HTMLInputElement>['value']): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.length > 0
  if (typeof value === 'number') return true
  if (Array.isArray(value)) return value.length > 0
  return false
}

export function AppSearchInput({
  containerClassName,
  className,
  value,
  onChange,
  ...rest
}: AppSearchInputProps) {
  const showClear = hasClearableValue(value)

  const handleClear = () => {
    onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)
  }

  return (
    <div className={cn('relative w-full max-w-sm', containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0 pointer-events-none" />
      <input
        {...rest}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full rounded-lg border border-input bg-input pl-9 py-2.5 text-base text-foreground min-h-[44px]',
          showClear ? 'pr-10' : 'pr-3',
          'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all',
          className
        )}
      />
      {showClear && (
        <button
          type="button"
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
        >
          <X className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      )}
    </div>
  )
}
