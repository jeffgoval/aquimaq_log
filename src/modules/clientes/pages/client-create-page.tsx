import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientInput } from '../schemas/client.schema'
import { useCreateClient } from '../hooks/use-client-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppPhoneInput, AppCpfCnpjInput } from '@/shared/components/app/app-numeric-input'

export function ClientCreatePage() {
  const navigate = useNavigate()
  const create = useCreateClient()
  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema) as Resolver<ClientInput>,
    defaultValues: { name: '', is_active: true },
  })
  const { register, control, formState: { errors } } = form

  const onSubmit = form.handleSubmit(async (v) => { await create.mutateAsync(v); navigate(ROUTES.CLIENTS) })

  return (
    <div className="max-w-2xl">
      <AppPageHeader backTo={ROUTES.CLIENTS} backLabel="Voltar aos clientes" title="Novo Cliente" />
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
              <Controller
                name="document"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <AppCpfCnpjInput
                    ref={ref}
                    value={value ?? ''}
                    onBlur={onBlur}
                    onValueChange={(vals) => onChange(vals.formattedValue)}
                  />
                )}
              />
            </div>
            <div>
              <label className="field-label">Telefone</label>
              <Controller
                name="phone"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <AppPhoneInput
                    ref={ref}
                    value={value ?? ''}
                    onBlur={onBlur}
                    onValueChange={(vals) => onChange(vals.formattedValue)}
                  />
                )}
              />
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
          <AppButton type="submit" variant="primary" size="lg" loading={create.isPending} loadingText="Salvando...">
            Cadastrar cliente
          </AppButton>
          <Link to={ROUTES.CLIENTS} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
