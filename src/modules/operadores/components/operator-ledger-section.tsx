import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, X } from 'lucide-react'
import { AppButton } from '@/shared/components/app/app-button'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppMoney } from '@/shared/components/app/app-money'
import { operatorLedgerMovementSchema, type OperatorLedgerMovementInput } from '../schemas/operator-ledger.schema'
import { useInsertOperatorLedgerEntry, useOperatorLedgerRows, useUpdateOperatorLedgerEntry } from '../hooks/use-operator-queries'
import { useServicesByOperatorWorklogs } from '@/modules/servicos/hooks/use-service-queries'
import dayjs from '@/shared/lib/dayjs'
import { cn } from '@/shared/lib/cn'
import { NumericFormat } from 'react-number-format'

const ENTRY_LABELS: Record<string, string> = {
  advance: 'Vale / adiantamento',
  payment: 'Pagamento',
  commission: 'Comissão',
  credit: 'Crédito',
}

const ENTRY_BADGE_CLASSES: Record<string, string> = {
  advance: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  payment: 'bg-green-100 text-green-900 dark:bg-green-500/15 dark:text-green-200',
  credit: 'bg-blue-500/15 text-blue-800 dark:text-blue-200',
  commission: 'bg-purple-500/15 text-purple-800 dark:text-purple-200',
}

interface OperatorLedgerSectionProps {
  operatorId: string
}

function makeDefaults(entry_type: OperatorLedgerMovementInput['entry_type']): OperatorLedgerMovementInput {
  return {
    entry_type,
    amount: 0,
    entry_date: dayjs().format('YYYY-MM-DD'),
    notes: '',
    service_id: null,
    commission_percent: null,
  }
}

export const OperatorLedgerSection = ({ operatorId }: OperatorLedgerSectionProps) => {
  const { data: rows, isLoading } = useOperatorLedgerRows(operatorId)
  const { data: services } = useServicesByOperatorWorklogs(operatorId)
  const insert = useInsertOperatorLedgerEntry(operatorId)
  const update = useUpdateOperatorLedgerEntry(operatorId)

  const [editingId, setEditingId] = useState<string | null>(null)
  const editingRow = useMemo(() => (rows ?? []).find((r) => r.id === editingId) ?? null, [rows, editingId])
  const editOpen = !!editingRow

  const advanceForm = useForm<OperatorLedgerMovementInput>({
    resolver: zodResolver(operatorLedgerMovementSchema) as Resolver<OperatorLedgerMovementInput>,
    defaultValues: makeDefaults('advance'),
  })

  const paymentForm = useForm<OperatorLedgerMovementInput>({
    resolver: zodResolver(operatorLedgerMovementSchema) as Resolver<OperatorLedgerMovementInput>,
    defaultValues: makeDefaults('payment'),
  })

  const commissionForm = useForm<OperatorLedgerMovementInput>({
    resolver: zodResolver(operatorLedgerMovementSchema) as Resolver<OperatorLedgerMovementInput>,
    defaultValues: makeDefaults('commission'),
  })

  const editForm = useForm<OperatorLedgerMovementInput>({
    resolver: zodResolver(operatorLedgerMovementSchema) as Resolver<OperatorLedgerMovementInput>,
    defaultValues: makeDefaults('advance'),
  })

  useEffect(() => {
    if (!editingRow) return
    editForm.reset({
      entry_type: editingRow.entry_type as OperatorLedgerMovementInput['entry_type'],
      amount: Number(editingRow.amount ?? 0),
      entry_date: dayjs(editingRow.entry_date).format('YYYY-MM-DD'),
      notes: (editingRow.notes ?? '') as string,
      service_id: editingRow.service_id ?? null,
      commission_percent: (editingRow as { commission_percent?: number | null }).commission_percent ?? null,
    })
  }, [editingRow?.id, editForm])

  async function submit(v: OperatorLedgerMovementInput, type: OperatorLedgerMovementInput['entry_type']) {
    await insert.mutateAsync({
      entry_type: type,
      amount: v.amount,
      entry_date: v.entry_date,
      notes: v.notes?.trim() || null,
      service_id: v.service_id || null,
      commission_percent: v.commission_percent ?? null,
    })
  }

  const onAdvance = advanceForm.handleSubmit(async (v) => {
    await submit(v, 'advance')
    advanceForm.reset(makeDefaults('advance'))
  })

  const onPayment = paymentForm.handleSubmit(async (v) => {
    await submit(v, 'payment')
    paymentForm.reset(makeDefaults('payment'))
  })

  const onCommission = commissionForm.handleSubmit(async (v) => {
    await submit(v, 'commission')
    commissionForm.reset(makeDefaults('commission'))
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

  const closeEdit = () => {
    setEditingId(null)
    editForm.reset(makeDefaults('advance'))
  }

  const onEditSubmit = editForm.handleSubmit(async (v) => {
    if (!editingRow) return
    await update.mutateAsync({
      id: editingRow.id,
      payload: {
        entry_type: v.entry_type,
        amount: v.amount,
        entry_date: v.entry_date,
        notes: v.notes?.trim() || null,
        service_id: v.service_id || null,
        commission_percent: v.entry_type === 'commission' ? (v.commission_percent ?? null) : null,
      },
    })
    closeEdit()
  })

  const editModal = editOpen ? (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Editar lançamento"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeEdit()
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Editar lançamento</p>
            <p className="text-xs text-muted-foreground">
              Ajuste data, valor, serviço e observações.
            </p>
          </div>
          <AppButton type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeEdit} aria-label="Fechar">
            <X className="h-4 w-4" />
          </AppButton>
        </div>

        <form onSubmit={onEditSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Tipo</label>
              <select className="field" {...editForm.register('entry_type')}>
                <option value="advance">Vale / adiantamento</option>
                <option value="payment">Pagamento</option>
                <option value="commission">Comissão</option>
              </select>
            </div>
            <div>
              <label className="field-label">Data *</label>
              <input type="date" className="field" {...editForm.register('entry_date')} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Valor *</label>
              <Controller
                name="amount"
                control={editForm.control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={value || ''}
                    onValueChange={(vv) => onChange(vv.floatValue ?? 0)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {editForm.formState.errors.amount && (
                <span className="field-error">{editForm.formState.errors.amount.message}</span>
              )}
            </div>
            {editForm.watch('entry_type') === 'commission' ? (
              <div>
                <label className="field-label">% sobre o frete (opcional)</label>
                <Controller
                  name="commission_percent"
                  control={editForm.control}
                  render={({ field: { onChange, value } }) => (
                    <NumericFormat
                      className="field"
                      value={value ?? ''}
                      onValueChange={(vv) => onChange(vv.floatValue ?? null)}
                      suffix="%"
                      decimalSeparator=","
                      decimalScale={2}
                      allowNegative={false}
                      placeholder="Ex.: 10%"
                    />
                  )}
                />
              </div>
            ) : (
              <div />
            )}
          </div>

          {serviceSelect(editForm as unknown as typeof advanceForm)}

          <div>
            <label className="field-label">Observações</label>
            <input className="field" placeholder="Ex.: quinzena fechada" {...editForm.register('notes')} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <AppButton type="button" variant="secondary" size="sm" onClick={closeEdit} disabled={update.isPending}>
              Cancelar
            </AppButton>
            <AppButton type="submit" size="sm" loading={update.isPending} loadingText="...">
              Guardar alterações
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  ) : null

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      {typeof document !== 'undefined' ? createPortal(editModal, document.body) : null}
      <div>
        <h2 className="typo-section-title mb-1">Vale, adiantamento, pagamentos e comissões</h2>
        <p className="typo-body-muted text-sm">
          Vales somam como crédito já entregue ao operador. O saldo considera horas trabalhadas (taxa padrão), menos vales e pagamentos registados.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Advance form */}
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

        {/* Payment form */}
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

        {/* Commission form */}
        <form onSubmit={onCommission} className="rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-500/5 p-4 space-y-3 lg:col-span-2">
          <h3 className="font-semibold text-sm text-foreground">Registrar comissão (guincho / frete)</h3>
          <p className="text-xs text-muted-foreground">Use para registrar a comissão paga ao operador sobre o frete — ex.: 10% do valor cobrado ao cliente.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="field-label">Valor da comissão *</label>
              <Controller
                name="amount"
                control={commissionForm.control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={value || ''}
                    onValueChange={(v) => onChange(v.floatValue ?? 0)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {commissionForm.formState.errors.amount && (
                <span className="field-error">{commissionForm.formState.errors.amount.message}</span>
              )}
            </div>
            <div>
              <label className="field-label">% sobre o frete (referência)</label>
              <Controller
                name="commission_percent"
                control={commissionForm.control}
                render={({ field: { onChange, value } }) => (
                  <NumericFormat
                    className="field"
                    value={value ?? ''}
                    onValueChange={(v) => onChange(v.floatValue ?? null)}
                    suffix="%"
                    decimalSeparator=","
                    decimalScale={2}
                    allowNegative={false}
                    placeholder="Ex.: 10%"
                  />
                )}
              />
            </div>
            <div>
              <label className="field-label">Data *</label>
              <input type="date" className="field" {...commissionForm.register('entry_date')} />
            </div>
            <div>
              <label className="field-label">Serviço (opcional)</label>
              <select
                className="field"
                value={commissionForm.watch('service_id') ?? ''}
                onChange={(e) => commissionForm.setValue('service_id', e.target.value || null)}
              >
                <option value="">— Geral —</option>
                {(services ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {dayjs(s.service_date).format('DD/MM/YYYY')} · {s.clients?.name ?? 'Cliente'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">Observações</label>
            <input className="field" placeholder="Ex.: 10% frete São Paulo–Campinas" {...commissionForm.register('notes')} />
          </div>
          <AppButton type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" loading={insert.isPending} loadingText="...">
            Registrar comissão
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
                      <th className="p-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="p-3 tabular-nums">{dayjs(row.entry_date).format('DD/MM/YYYY')}</td>
                        <td className="p-3">
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md', ENTRY_BADGE_CLASSES[row.entry_type] ?? '')}>
                            {ENTRY_LABELS[row.entry_type] ?? row.entry_type}
                          </span>
                          {row.entry_type === 'commission' && (row as { commission_percent?: number | null }).commission_percent != null && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {Number((row as { commission_percent?: number | null }).commission_percent).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                            </span>
                          )}
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
                        <td className="p-3 text-right">
                          <AppButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => setEditingId(row.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </AppButton>
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
