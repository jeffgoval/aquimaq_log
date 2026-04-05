import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientInput } from '../schemas/client.schema'
import { useClient, useUpdateClient } from '../hooks/use-client-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'

function nullIfEmpty(s: string | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export function ClientEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading, isError, error } = useClient(id ?? '')
  const update = useUpdateClient(id ?? '')

  const form = useForm<ClientInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(clientSchema) as any,
    defaultValues: { name: '', is_active: true },
  })
  const { register, formState: { errors }, reset } = form

  useEffect(() => {
    if (!client) return
    reset({
      name: client.name,
      document: client.document ?? '',
      phone: client.phone ?? '',
      email: client.email ?? '',
      notes: client.notes ?? '',
      is_active: client.is_active,
    })
  }, [client, reset])

  const onSubmit = form.handleSubmit(async (v) => {
    if (!id) return
    await update.mutateAsync({
      name: v.name.trim(),
      document: nullIfEmpty(v.document),
      phone: nullIfEmpty(v.phone),
      email: v.email?.trim() ? v.email.trim() : null,
      notes: nullIfEmpty(v.notes),
      is_active: v.is_active,
    })
    navigate(ROUTES.CLIENT_DETAIL(id))
  })

  if (!id) return <AppErrorState message="Cliente inválido" />
  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />

  return (
    <div className="max-w-2xl">
      <AppPageHeader
        backTo={id ? ROUTES.CLIENT_DETAIL(id) : ROUTES.CLIENTS}
        backLabel="Voltar ao cliente"
        title="Editar Cliente"
        description={client?.name}
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="field-label">Nome / Razão Social *</label>
              <input {...register('name')} className="field" placeholder="Nome do cliente" />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>
            <div>
              <label className="field-label">CPF / CNPJ</label>
              <input {...register('document')} className="field" placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="field-label">Telefone</label>
              <input {...register('phone')} className="field" placeholder="(11) 99999-9999" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">E-mail</label>
              <input {...register('email')} type="email" className="field" placeholder="cliente@email.com" />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Observações</label>
              <textarea {...register('notes')} rows={3} className="field resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" {...register('is_active')} className="rounded border-input size-4" />
                <span className="text-sm text-foreground">Cliente ativo</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AppButton type="submit" variant="primary" size="lg" loading={update.isPending} loadingText="Salvando...">
            Salvar alterações
          </AppButton>
          <Link to={ROUTES.CLIENT_DETAIL(id)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
