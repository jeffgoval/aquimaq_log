import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, User, Edit } from 'lucide-react'
import { useOperatorList } from '../hooks/use-operator-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/constants/routes'

export function OperatorListPage() {
  const { data, isLoading, isError, error, refetch } = useOperatorList()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = data?.filter(o => o.name.toLowerCase().includes(search.toLowerCase())) ?? []

  return (
    <div>
      <AppPageHeader
        title="Operadores"
        description="Gestão de operadores e ledger financeiro"
        actions={
          <Link to={ROUTES.OPERATOR_NEW} className="flex items-center gap-2 gradient-amber text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm">
            <Plus className="h-4 w-4" />Novo operador
          </Link>
        }
      />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar operador..." className="w-full rounded-lg border border-input bg-input pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        filtered.length === 0
          ? <AppEmptyState title="Nenhum operador encontrado" action={<Link to={ROUTES.OPERATOR_NEW} className="text-primary text-sm hover:underline">Cadastrar operador</Link>} />
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(op => (
              <div key={op.id} onClick={() => navigate(ROUTES.OPERATOR_DETAIL(op.id))}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all cursor-pointer flex flex-col gap-3 group">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 shrink-0"><User className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground text-sm truncate">{op.name}</h3>
                    <p className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-tight">
                      {op.phone || 'Sem telefone'}
                    </p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0', op.is_active ? 'bg-green-400/10 text-green-400' : 'bg-muted text-muted-foreground')}>
                    {op.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Taxa/hora</p>
                    <AppMoney value={op.default_hour_rate} size="sm" />
                  </div>
                  <span className="text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">Ver Ledger</span>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  )
}
