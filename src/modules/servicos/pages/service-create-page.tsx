import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCreateServiceController } from '../hooks/use-create-service-controller'
import { Controller } from 'react-hook-form'
import { AppCurrencyInput, AppDecimalInput } from '@/shared/components/app/app-numeric-input'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppButton } from '@/shared/components/app/app-button'
import { AppTable, AppTableRow, AppTableCell } from '@/shared/components/app/app-table'
import { AppMoney } from '@/shared/components/app/app-money'
import { ROUTES } from '@/shared/constants/routes'
import { buildInstallmentsPreview } from '@/features/create-installments/create-installments'
import dayjs from '@/shared/lib/dayjs'

export function ServiceCreatePage() {
  const { form, onSubmit, isSubmitting, clients, operators, tractors } = useCreateServiceController()
  const { register, control, watch, formState: { errors } } = form

  const billingMode = watch('client_billing_mode')
  const billAmount = watch('client_billing_amount')
  const instCount = watch('client_installment_count')
  const feePct = watch('client_fee_percent')
  const firstDue = watch('client_first_due_date')

  const instPreview = useMemo(() => {
    if (billingMode !== 'installments') return []
    const amt = Number(billAmount) || 0
    if (amt <= 0) return []
    const n = Math.max(2, Number(instCount) || 2)
    return buildInstallmentsPreview({
      totalAmount: amt,
      installmentCount: n,
      feePercent: Number(feePct) || 0,
      firstDueDate: firstDue || dayjs().format('YYYY-MM-DD'),
    })
  }, [billingMode, billAmount, instCount, feePct, firstDue])

  return (
    <div className="max-w-2xl">
      <AppPageHeader
        title="Novo Serviço"
        description="Podes já registar se o cliente pagou ou o que falta receber; também podes fazer isso depois na ficha do serviço."
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">Cliente *</label>
              <select {...register('client_id')} className="field">
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.client_id && <p className="field-error">{errors.client_id.message}</p>}
              <p className="mt-1.5 typo-caption">
                <Link to={ROUTES.CLIENT_NEW} className="text-primary font-medium hover:underline">
                  Cadastrar cliente
                </Link>
              </p>
            </div>
            <div>
              <label className="field-label">Trator *</label>
              <select {...register('tractor_id')} className="field">
                <option value="">Selecione...</option>
                {tractors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.tractor_id && <p className="field-error">{errors.tractor_id.message}</p>}
            </div>
            <div>
              <label className="field-label">Operador</label>
              <select {...register('primary_operator_id')} className="field">
                <option value="">Nenhum</option>
                {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Data *</label>
              <input {...register('service_date')} type="date" className="field" />
              {errors.service_date && <p className="field-error">{errors.service_date.message}</p>}
            </div>
            <div>
              <label className="field-label">Taxa/hora *</label>
              <Controller
                name="contracted_hour_rate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={value ?? ''}
                    onValueChange={(v) => onChange(v.floatValue ?? undefined)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {errors.contracted_hour_rate && <p className="field-error">{errors.contracted_hour_rate.message}</p>}
            </div>
            <div className="sm:col-span-3">
              <label className="field-label">Observações</label>
              <textarea {...register('notes')} rows={2} className="field resize-none" placeholder="Detalhes, condições, localidade..." />
            </div>
            <p className="sm:col-span-3 typo-caption text-muted-foreground border-t border-border pt-3">
              Abaixo: <strong className="text-foreground font-medium">conta a receber</strong> (pagamento à vista, pendente ou parcelas).
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4 border-l-4 border-l-primary/40">
          <div>
            <h2 className="typo-section-title mb-1">Conta a receber do cliente</h2>
            <p className="typo-caption text-muted-foreground">
              Aparece em Financeiro. O total exato pode alinhar com o horímetro depois.
            </p>
          </div>
          <div>
            <label className="field-label">Situação do pagamento</label>
            <select {...register('client_billing_mode')} className="field max-w-md">
              <option value="later">Registar depois (na ficha do serviço)</option>
              <option value="paid_full">Cliente já pagou (à vista)</option>
              <option value="pending">Ainda não pagou (valor a receber)</option>
              <option value="installments">Parcelado</option>
            </select>
          </div>

          {billingMode === 'paid_full' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Valor recebido *</label>
                <Controller
                  name="client_billing_amount"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <AppCurrencyInput
                      value={value ?? ''}
                      onValueChange={(v) => onChange(v.floatValue ?? 0)}
                      placeholder="R$ 0,00"
                    />
                  )}
                />
                {errors.client_billing_amount && <p className="field-error">{errors.client_billing_amount.message}</p>}
              </div>
              <div>
                <label className="field-label">Data do pagamento *</label>
                <input type="date" className="field" {...register('client_payment_date')} />
                {errors.client_payment_date && <p className="field-error">{errors.client_payment_date.message}</p>}
              </div>
            </div>
          )}

          {billingMode === 'pending' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Valor a receber *</label>
                <Controller
                  name="client_billing_amount"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <AppCurrencyInput
                      value={value ?? ''}
                      onValueChange={(v) => onChange(v.floatValue ?? 0)}
                      placeholder="R$ 0,00"
                    />
                  )}
                />
                {errors.client_billing_amount && <p className="field-error">{errors.client_billing_amount.message}</p>}
              </div>
              <div>
                <label className="field-label">Vencimento *</label>
                <input type="date" className="field" {...register('client_due_date')} />
                {errors.client_due_date && <p className="field-error">{errors.client_due_date.message}</p>}
              </div>
            </div>
          )}

          {billingMode === 'installments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="field-label">Valor total *</label>
                  <Controller
                    name="client_billing_amount"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <AppCurrencyInput
                        value={value ?? ''}
                        onValueChange={(v) => onChange(v.floatValue ?? 0)}
                        placeholder="R$ 0,00"
                      />
                    )}
                  />
                  {errors.client_billing_amount && <p className="field-error">{errors.client_billing_amount.message}</p>}
                </div>
                <div>
                  <label className="field-label">Nº parcelas *</label>
                  <Controller
                    name="client_installment_count"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <AppDecimalInput
                        value={value === undefined || value === null ? '' : String(value)}
                        onValueChange={(v) => onChange(Number(v.value) || 2)}
                        placeholder="2"
                        decimalScale={0}
                      />
                    )}
                  />
                  {errors.client_installment_count && <p className="field-error">{errors.client_installment_count.message}</p>}
                </div>
                <div>
                  <label className="field-label">Juros (%)</label>
                  <Controller
                    name="client_fee_percent"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <AppDecimalInput
                        value={value === undefined || value === null ? '' : String(value)}
                        onValueChange={(v) => onChange(Number(v.value) || 0)}
                        placeholder="0"
                        suffix=" %"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="field-label">1º vencimento *</label>
                  <input type="date" className="field" {...register('client_first_due_date')} />
                  {errors.client_first_due_date && <p className="field-error">{errors.client_first_due_date.message}</p>}
                </div>
              </div>
              {instPreview.length > 0 && (
                <AppTable
                  columns={[
                    { header: 'Parcela' },
                    { header: 'Vencimento' },
                    { header: 'Valor', align: 'right' },
                  ]}
                >
                  {instPreview.map((item) => (
                    <AppTableRow key={item.installmentNumber}>
                      <AppTableCell className="text-muted-foreground">
                        {item.installmentNumber}/{Math.max(2, Number(instCount) || 2)}
                      </AppTableCell>
                      <AppTableCell>{dayjs(item.dueDate).format('DD/MM/YYYY')}</AppTableCell>
                      <AppTableCell align="right" className="font-medium">
                        <AppMoney value={item.amount} size="sm" />
                      </AppTableCell>
                    </AppTableRow>
                  ))}
                </AppTable>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <AppButton type="submit" variant="primary" size="lg" loading={isSubmitting} loadingText="Criando...">
            Criar serviço
          </AppButton>
          <Link to={ROUTES.SERVICES} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
