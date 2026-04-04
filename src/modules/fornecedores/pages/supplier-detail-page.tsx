import { useParams, Link } from 'react-router-dom'
import { Store } from 'lucide-react'
import { useSupplier } from '../hooks/use-supplier-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { AppBadge } from '@/shared/components/app/app-badge'
import { ROUTES } from '@/shared/constants/routes'

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: supplier, isLoading, isError, error, refetch } = useSupplier(id ?? '')

  if (!id) {
    return <AppErrorState message="Fornecedor não encontrado" />
  }

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} onRetry={refetch} />
  if (!supplier) return <AppErrorState message="Fornecedor não encontrado" />

  return (
    <div className="max-w-2xl space-y-6">
      <AppPageHeader
        title={supplier.name}
        description={supplier.cnpj || undefined}
        actions={
          <div className="flex items-center gap-2">
            <Link to={ROUTES.SUPPLIER_EDIT(supplier.id)} className="flex items-center gap-2 bg-secondary text-foreground font-medium px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm">
              Editar
            </Link>
            <Link to={ROUTES.SUPPLIERS} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
              ← Lista
            </Link>
          </div>
        }
      />

      <AppDataCard
        title="Dados cadastrais"
        icon={Store}
        badge={
          <AppBadge variant={supplier.is_active ? 'default' : 'outline'}>
            {supplier.is_active ? 'Ativo' : 'Inativo'}
          </AppBadge>
        }
        items={[
          { label: 'CNPJ', value: supplier.cnpj || '—' },
          { label: 'Telefone', value: supplier.phone || '—' },
          { label: 'Endereço', value: supplier.address || '—' },
        ]}
        footer={
          supplier.notes ? (
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">{supplier.notes}</p>
          ) : undefined
        }
      />
    </div>
  )
}
