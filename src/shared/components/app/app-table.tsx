import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

// ─── AppTable ─────────────────────────────────────────────────────────────────

interface AppTableColumn {
  header: string
  align?: 'left' | 'right' | 'center'
  className?: string
}

interface AppTableProps {
  columns: AppTableColumn[]
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AppTable({ columns, children, footer, className }: AppTableProps) {
  return (
    <div className={cn('max-w-full min-w-0 overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  'typo-table-header px-3 py-2.5 font-semibold',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
        {footer && (
          <tfoot className="bg-muted/20 border-t border-border">{footer}</tfoot>
        )}
      </table>
    </div>
  )
}

// ─── AppTableRow ──────────────────────────────────────────────────────────────

interface AppTableRowProps {
  children: ReactNode
  className?: string
}

export function AppTableRow({ children, className }: AppTableRowProps) {
  return (
    <tr className={cn('border-b border-border last:border-0 hover:bg-muted/10 transition-colors', className)}>
      {children}
    </tr>
  )
}

// ─── AppTableCell ─────────────────────────────────────────────────────────────

interface AppTableCellProps {
  children: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}

export function AppTableCell({ children, align, className }: AppTableCellProps) {
  return (
    <td
      className={cn(
        'typo-table-cell px-3 py-2 align-middle',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </td>
  )
}
