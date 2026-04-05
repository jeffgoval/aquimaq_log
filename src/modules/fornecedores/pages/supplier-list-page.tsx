import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Store, Edit } from 'lucide-react'
import { useSupplierList } from '../hooks/use-supplier-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { AppBadge } from '@/shared/components/app/app-badge'
import { ROUTES } from '@/shared/constants/routes'

export function SupplierListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error, refetch } = useSupplierList()

  const filtered = data?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.cnpj?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Fornecedores"
        description="Cadastro para uso nos custos de máquina"
        actions={
          <Link
            to={ROUTES.SUPPLIER_NEW}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-primary text-primary-foreground rounded-lg text-base font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all outline-none"
          >
            <Plus className="h-4 w-4" />
            Novo fornecedor
          </Link>
        }
      />

      <AppSearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, CNPJ ou telefone..."
        containerClassName="mb-4"
      />

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {!filtered?.length ? (
            <AppEmptyState title="Nenhum fornecedor cadastrado" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((s) => (
                <AppDataCard
                  key={s.id}
                  title={s.name}
                  subtitle={s.cnpj || 'Sem CNPJ'}
                  icon={Store}
                  onClick={() => navigate(ROUTES.SUPPLIER_DETAIL(s.id))}
                  badge={
                    <AppBadge variant={s.is_active ? 'default' : 'outline'}>
                      {s.is_active ? 'Ativo' : 'Inativo'}
                    </AppBadge>
                  }
                  items={[
                    { label: 'Telefone', value: s.phone || '—' },
                    { label: 'Endereço', value: s.address ? <span className="line-clamp-2">{s.address}</span> : '—' },
                  ]}
                  footer={
                    <div className="flex gap-2 pt-1 border-t border-border/50">
                      <Link
                        to={ROUTES.SUPPLIER_EDIT(s.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Link>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
