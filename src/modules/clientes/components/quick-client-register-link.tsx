import { UserPlus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

/** Texto único em todo o app para abrir o cadastro rápido de cliente. */
export const QUICK_CLIENT_REGISTER_LABEL = 'Novo cliente'

const baseClass =
  'inline-flex w-fit max-w-full items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline whitespace-nowrap'

export interface QuickClientRegisterLinkProps {
  onClick: () => void
  className?: string
}

export const QuickClientRegisterLink = ({ onClick, className }: QuickClientRegisterLinkProps) => (
  <button type="button" onClick={onClick} className={cn(baseClass, className)}>
    <UserPlus className="size-4 shrink-0" aria-hidden />
    {QUICK_CLIENT_REGISTER_LABEL}
  </button>
)
