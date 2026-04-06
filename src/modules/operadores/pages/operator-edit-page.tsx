import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppCurrencyInput, AppPhoneInput, AppCnhInput } from '@/shared/components/app/app-numeric-input'
import { AppButton } from '@/shared/components/app/app-button'
import { operatorSchema, type OperatorInput } from '../schemas/operator.schema'
import { useOperator, useUpdateOperator } from '../hooks/use-operator-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'

function nullIfEmpty(s: string | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export function OperatorEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: operator, isLoading, isError, error } = useOperator(id ?? '')
  const update = useUpdateOperator(id ?? '')

  const form = useForm<OperatorInput>({
    resolver: zodResolver(operatorSchema) as Resolver<OperatorInput>,
    defaultValues: { name: '', default_hour_rate: 0, is_active: true },
  })
  const { register, control, formState: { errors }, reset } = form

  useEffect(() => {
    if (!operator) return
    reset({
      name: operator.name,
      phone: operator.phone ?? '',
      document: operator.document ?? '',
      default_hour_rate: operator.default_hour_rate,
      is_active: operator.is_active,
      notes: operator.notes ?? '',
    })
  }, [operator, reset])

  const onSubmit = form.handleSubmit(async (v) => {
    if (!id) return
    await update.mutateAsync({
      name: v.name.trim(),
      phone: nullIfEmpty(v.phone),
      document: nullIfEmpty(v.document),
      default_hour_rate: v.default_hour_rate,
      is_active: v.is_active,
      notes: nullIfEmpty(v.notes),
    })
    navigate(ROUTES.OPERATOR_DETAIL(id))
  })

  if (!id) return <AppErrorState message="Operador inválido" />
  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />

  return (
    <div className="max-w-2xl">
      <AppPageHeader
        backTo={id ? ROUTES.OPERATOR_DETAIL(id) : ROUTES.OPERATORS}
        backLabel="Voltar ao operador"
        title="Editar Operador"
        description={operator?.name}
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    value={value ?? ''}
                    onValueChange={(vals) => onChange(vals.floatValue ?? 0)}
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
        </div>
        <div className="flex items-center gap-3">
          <AppButton type="submit" variant="primary" size="lg" loading={update.isPending} loadingText="Salvando...">
            Salvar alterações
          </AppButton>
          <Link to={ROUTES.OPERATOR_DETAIL(id)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
