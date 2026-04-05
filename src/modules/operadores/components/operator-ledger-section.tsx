import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppButton } from '@/shared/components/app/app-button'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppMoney } from '@/shared/components/app/app-money'
import { operatorLedgerMovementSchema, type OperatorLedgerMovementInput } from '../schemas/operator-ledger.schema'
import { useInsertOperatorLedgerEntry, useOperatorLedgerRows } from '../hooks/use-operator-queries'
import { useServicesByOperatorWorklogs } from '@/modules/servicos/hooks/use-service-queries'
import dayjs from '@/shared/lib/dayjs'
import { cn } from '@/shared/lib/cn'

const ENTRY_LABELS: Record<OperatorLedgerMovementInput['entry_type'], string> = {
  advance: 'Vale / adiantamento',
  payment: 'Pagamento',
}

interface OperatorLedgerSectionProps {
  operatorId: string
}

export const OperatorLedgerSection = ({ operatorId }: OperatorLedgerSectionProps) => {
  const { data: rows, isLoading } = useOperatorLedgerRows(operatorId)
  const { data: services } = useServicesByOperatorWorklogs(operatorId)
  const insert = useInsertOperatorLedgerEntry(operatorId)

  const advanceForm = useForm<OperatorLedgerMovementInput>({
    resolver: zodResolver(operatorLedgerMovementSchema) as Resolver<OperatorLedgerMovementInput>,
    defaultValues: {
      entry_type: 'advance',
      amount: 0,
      entry_date: dayjs().format('YYYY-MM-DD'),
      notes: '',
      service_id: null,
    },
  })

  const paymentForm = useForm<OperatorLedgerMovementInput>({
    resolver: zodResolver(operatorLedgerMovementSchema) as Resolver<OperatorLedgerMovementInput>,
    defaultValues: {
      entry_type: 'payment',
      amount: 0,
      entry_date: dayjs().format('YYYY-MM-DD'),
      notes: '',
      service_id: null,
    },
  })

  const onAdvance = advanceForm.handleSubmit(async (v) => {
    await insert.mutateAsync({
      entry_type: 'advance',
      amount: v.amount,
      entry_date: v.entry_date,
      notes: v.notes?.trim() || null,
      service_id: v.service_id || null,
    })
    advanceForm.reset({
      entry_type: 'advance',
      amount: 0,
      entry_date: dayjs().format('YYYY-MM-DD'),
      notes: '',
      service_id: null,
    })
  })

  const onPayment = paymentForm.handleSubmit(async (v) => {
    await insert.mutateAsync({
      entry_type: 'payment',
      amount: v.amount,
      entry_date: v.entry_date,
      notes: v.notes?.trim() || null,
      service_id: v.service_id || null,
    })
    paymentForm.reset({
      entry_type: 'payment',
      amount: 0,
      entry_date: dayjs().format('YYYY-MM-DD'),
      notes: '',
      service_id: null,
    })
  })

  const serviceSelect = (form: typeof advanceForm) => (
    <div>
      <label className="field-label">Serviço (opcional)</label>
      <select
        className="field"
        value={form.watch('service_id') ?? ''}
        onChange={(e) => form.setValue('service_id', e.target.value || null)}
      >
        <option value="">— Geral —</option>
        {(services ?? []).map((s) => (
          <option key={s.id} value={s.id}>
            {dayjs(s.service_date).format('DD/MM/YYYY')} · {s.clients?.name ?? 'Cliente'}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <div>
        <h2 className="typo-section-title mb-1">Vale, adiantamento e pagamentos</h2>
        <p className="typo-body-muted text-sm">
          Vales somam como crédito já entregue ao operador. O saldo considera horas trabalhadas (taxa padrão), menos vales e pagamentos registados.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onAdvance} className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="font-semibold text-sm text-foreground">Registrar vale / adiantamento</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Valor *</label>
              <Controller
                name="amount"
                control={advanceForm.control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={value || ''}
                    onValueChange={(v) => onChange(v.floatValue ?? 0)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {advanceForm.formState.errors.amount && (
                <span className="field-error">{advanceForm.formState.errors.amount.message}</span>
              )}
            </div>
            <div>
              <label className="field-label">Data *</label>
              <input type="date" className="field" {...advanceForm.register('entry_date')} />
              {advanceForm.formState.errors.entry_date && (
                <span className="field-error">{advanceForm.formState.errors.entry_date.message}</span>
              )}
            </div>
          </div>
          {serviceSelect(advanceForm)}
          <div>
            <label className="field-label">Observações</label>
            <input className="field" placeholder="Ex.: vale combustível" {...advanceForm.register('notes')} />
          </div>
          <AppButton type="submit" size="sm" loading={insert.isPending} loadingText="...">
            Registrar vale
          </AppButton>
        </form>

        <form onSubmit={onPayment} className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="font-semibold text-sm text-foreground">Registrar pagamento ao operador</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Valor *</label>
              <Controller
                name="amount"
                control={paymentForm.control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={value || ''}
                    onValueChange={(v) => onChange(v.floatValue ?? 0)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {paymentForm.formState.errors.amount && (
                <span className="field-error">{paymentForm.formState.errors.amount.message}</span>
              )}
            </div>
            <div>
              <label className="field-label">Data *</label>
              <input type="date" className="field" {...paymentForm.register('entry_date')} />
              {paymentForm.formState.errors.entry_date && (
                <span className="field-error">{paymentForm.formState.errors.entry_date.message}</span>
              )}
            </div>
          </div>
          {serviceSelect(paymentForm)}
          <div>
            <label className="field-label">Observações</label>
            <input className="field" placeholder="Ex.: quinzena fechada" {...paymentForm.register('notes')} />
          </div>
          <AppButton type="submit" size="sm" variant="secondary" loading={insert.isPending} loadingText="...">
            Registrar pagamento
          </AppButton>
        </form>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2">Histórico</h3>
        {isLoading
          ? <p className="typo-body-muted text-sm">A carregar…</p>
          : !rows?.length
            ? <p className="typo-body-muted text-sm">Nenhum lançamento ainda.</p>
            : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left">
                      <th className="p-3 font-medium">Data</th>
                      <th className="p-3 font-medium">Tipo</th>
                      <th className="p-3 font-medium text-right">Valor</th>
                      <th className="p-3 font-medium hidden sm:table-cell">Serviço</th>
                      <th className="p-3 font-medium hidden md:table-cell">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="p-3 tabular-nums">{dayjs(row.entry_date).format('DD/MM/YYYY')}</td>
                        <td className="p-3">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-md',
                              row.entry_type === 'advance' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200' : '',
                              row.entry_type === 'payment' ? 'bg-green-500/15 text-green-800 dark:text-green-200' : '',
                              row.entry_type === 'credit' ? 'bg-blue-500/15 text-blue-800 dark:text-blue-200' : '',
                            )}
                          >
                            {ENTRY_LABELS[row.entry_type as 'advance' | 'payment'] ?? row.entry_type}
                          </span>
                        </td>
                        <td className="p-3 text-right tabular-nums font-medium">
                          <AppMoney value={row.amount} size="sm" />
                        </td>
                        <td className="p-3 typo-body-muted hidden sm:table-cell">
                          {row.services
                            ? `${dayjs(row.services.service_date).format('DD/MM/YYYY')} · ${row.services.clients?.name ?? '—'}`
                            : '—'}
                        </td>
                        <td className="p-3 typo-body-muted hidden md:table-cell max-w-[200px] truncate" title={row.notes ?? ''}>
                          {row.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </div>
  )
}
