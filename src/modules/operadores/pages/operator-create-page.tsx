import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppCurrencyInput, AppPhoneInput, AppCnhInput } from '@/shared/components/app/app-numeric-input'
import { AppButton } from '@/shared/components/app/app-button'
import { AppCard } from '@/shared/components/app/app-card'
import { useNavigate, Link } from 'react-router-dom'
import { operatorSchema, type OperatorInput } from '../schemas/operator.schema'
import { useCreateOperator } from '../hooks/use-operator-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'

export function OperatorCreatePage() {
  const navigate = useNavigate()
  const create = useCreateOperator()
  const form = useForm<OperatorInput>({
    resolver: zodResolver(operatorSchema) as Resolver<OperatorInput>,
    defaultValues: { name: '', default_hour_rate: 0, is_active: true },
  })
  const { register, control, formState: { errors } } = form

  const onSubmit = form.handleSubmit(async (v) => { await create.mutateAsync(v); navigate(ROUTES.OPERATORS) })

  return (
    <div className="max-w-2xl">
      <AppPageHeader backTo={ROUTES.OPERATORS} backLabel="Voltar aos operadores" title="Novo Operador" />
      <form onSubmit={onSubmit} className="space-y-5">
        <AppCard className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="field-label">Nome *</label>
              <input {...register('name')} className="field" placeholder="Nome completo" />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
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
            <div>
              <label className="field-label">CNH</label>
              <Controller
                name="document"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <AppCnhInput
                    ref={ref}
                    value={value ?? ''}
                    onBlur={onBlur}
                    onValueChange={(vals) => onChange(vals.formattedValue)}
                  />
                )}
              />
            </div>
            <div>
              <label className="field-label">Taxa por hora</label>
              <Controller
                name="default_hour_rate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={value || ''}
                    onValueChange={(v) => onChange(v.floatValue ?? 0)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {errors.default_hour_rate && <span className="field-error">{errors.default_hour_rate.message}</span>}
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input type="checkbox" {...register('is_active')} className="rounded border-input size-4" />
                <span className="text-sm text-foreground">Operador ativo</span>
              </label>
            </div>
          </div>
          <div>
            <label className="field-label">Observações</label>
            <textarea {...register('notes')} rows={3} className="field resize-none" placeholder="..." />
          </div>
        </AppCard>
        <div className="flex items-center gap-3">
          <AppButton type="submit" variant="primary" size="lg" loading={create.isPending} loadingText="Salvando...">
            Cadastrar operador
          </AppButton>
          <Link to={ROUTES.OPERATORS} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
