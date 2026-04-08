import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Store, Edit } from 'lucide-react'
import { useSupplierList } from '../hooks/use-supplier-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
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
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium">Fornecedor</th>
                    <th className="p-3 font-medium hidden md:table-cell">CNPJ</th>
                    <th className="p-3 font-medium hidden lg:table-cell">Telefone</th>
                    <th className="p-3 font-medium hidden lg:table-cell">Endereço</th>
                    <th className="p-3 font-medium whitespace-nowrap">Status</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                      onClick={() => navigate(ROUTES.SUPPLIER_DETAIL(s.id))}
                    >
                      <td className="p-3 min-w-0">
                        <div className="font-medium text-foreground truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden truncate">
                          {s.cnpj || 'Sem CNPJ'} · {s.phone || '—'}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell typo-body-muted">
                        {s.cnpj || '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell typo-body-muted">
                        {s.phone || '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell typo-body-muted max-w-[360px] truncate" title={s.address ?? ''}>
                        {s.address || '—'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <AppBadge variant={s.is_active ? 'default' : 'outline'}>
                          {s.is_active ? 'Ativo' : 'Inativo'}
                        </AppBadge>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Link
                          to={ROUTES.SUPPLIER_EDIT(s.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
