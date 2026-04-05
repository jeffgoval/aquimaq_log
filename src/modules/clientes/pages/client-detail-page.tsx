import { useParams, Link } from 'react-router-dom'
import { useClient } from '../hooks/use-client-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { ROUTES } from '@/shared/constants/routes'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: client, isLoading, isError, error } = useClient(id!)

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!client) return null

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.CLIENTS}
        backLabel="Voltar aos clientes"
        title={client.name}
        description={client.document || undefined}
        actions={
          <Link
            to={ROUTES.CLIENT_EDIT(client.id)}
            className="flex items-center gap-2 bg-secondary text-foreground font-medium px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm"
          >
            Editar
          </Link>
        }
      />
      <div className="rounded-xl border border-border bg-card p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Documento', value: client.document || '—' },
            { label: 'Telefone', value: client.phone || '—' },
            { label: 'E-mail', value: client.email || '—' },
            { label: 'Status', value: client.is_active ? 'Ativo' : 'Inativo' },
          ].map(({ label, value }) => (
            <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="font-medium text-foreground mt-0.5">{value}</dd></div>
          ))}
        </dl>
        {client.notes && <p className="mt-4 pt-4 border-t border-border text-sm text-foreground">{client.notes}</p>}
      </div>
    </div>
  )
}
