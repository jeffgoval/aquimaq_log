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
          : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(op => (
              <div key={op.id} onClick={() => navigate(ROUTES.OPERATOR_DETAIL(op.id))}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-primary/10 p-2.5"><User className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{op.name}</h3>
                    <p className="text-xs text-muted-foreground">{op.phone || 'Sem telefone'}</p>
                  </div>
                  <span className={cn('ml-auto text-xs font-medium px-2 py-0.5 rounded-full', op.is_active ? 'bg-green-400/10 text-green-400' : 'bg-muted text-muted-foreground')}>
                    {op.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Taxa/hora</p>
                    <AppMoney value={op.default_hour_rate} size="sm" />
                  </div>
                  <Link to={ROUTES.OPERATOR_DETAIL(op.id)} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Edit className="h-3.5 w-3.5" />Ver ledger
                  </Link>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  )
}
