import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientInput } from '../schemas/client.schema'
import { useCreateClient } from '../hooks/use-client-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { Link } from 'react-router-dom'

export function ClientCreatePage() {
  const navigate = useNavigate()
  const create = useCreateClient()
  const form = useForm<ClientInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(clientSchema) as any,
    defaultValues: { name: '', is_active: true } })
  const { register, formState: { errors } } = form

  const onSubmit = form.handleSubmit(async (v) => { await create.mutateAsync(v); navigate(ROUTES.CLIENTS) })

  return (
    <div className="max-w-2xl">
      <AppPageHeader title="Novo Cliente" />
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="field-label">Nome / Razão Social *</label>
              <input {...register('name')} className="field" placeholder="Nome do cliente" />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div><label className="field-label">CPF / CNPJ</label><input {...register('document')} className="field" placeholder="000.000.000-00" /></div>
            <div><label className="field-label">Telefone</label><input {...register('phone')} className="field" placeholder="(11) 99999-9999" /></div>
            <div className="sm:col-span-2"><label className="field-label">E-mail</label><input {...register('email')} type="email" className="field" placeholder="cliente@email.com" />{errors.email && <p className="field-error">{errors.email.message}</p>}</div>
            <div className="sm:col-span-2"><label className="field-label">Observações</label><textarea {...register('notes')} rows={3} className="field resize-none" /></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={create.isPending} className="gradient-amber text-white font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 text-sm">{create.isPending ? 'Salvando...' : 'Cadastrar cliente'}</button>
          <Link to={ROUTES.CLIENTS} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
