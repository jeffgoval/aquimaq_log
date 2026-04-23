import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, Pencil, X } from 'lucide-react'
import { AppButton } from '@/shared/components/app/app-button'
import { AppCurrencyInput } from '@/shared/components/app/app-numeric-input'
import { AppMoney } from '@/shared/components/app/app-money'
import { operatorLedgerMovementSchema, type OperatorLedgerMovementInput } from '../schemas/operator-ledger.schema'
import { useInsertOperatorLedgerEntry, useOperatorLedgerRows, useUpdateOperatorLedgerEntry } from '../hooks/use-operator-queries'
import { useServicesByOperatorWorklogs } from '@/modules/servicos/hooks/use-service-queries'
import dayjs from '@/shared/lib/dayjs'
import { cn } from '@/shared/lib/cn'
import { NumericFormat } from 'react-number-format'
import { AppCard } from '@/shared/components/app/app-card'

const ENTRY_LABELS: Record<string, string> = {
  advance: 'Adiantamento / Vale',
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

const ENTRY_TYPE_OPTIONS: { value: OperatorLedgerMovementInput['entry_type']; label: string; description: string }[] = [
  { value: 'advance', label: 'Adiantamento / Vale', description: 'Dinheiro entregue antes do pagamento final' },
  { value: 'payment', label: 'Pagamento', description: 'Pagamento do salário ou fechamento de conta' },
  { value: 'commission', label: 'Comissão', description: 'Comissão sobre frete ou serviço realizado' },
]

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
  const [viewingId, setViewingId] = useState<string | null>(null)
  const editingRow = useMemo(() => (rows ?? []).find((r) => r.id === editingId) ?? null, [rows, editingId])
  const viewingRow = useMemo(() => (rows ?? []).find((r) => r.id === viewingId) ?? null, [rows, viewingId])
  const editOpen = !!editingRow
  const viewOpen = !!viewingRow

  const [selectedType, setSelectedType] = useState<OperatorLedgerMovementInput['entry_type']>('advance')

  const addForm = useForm<OperatorLedgerMovementInput>({
    resolver: zodResolver(operatorLedgerMovementSchema) as Resolver<OperatorLedgerMovementInput>,
    defaultValues: makeDefaults('advance'),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  })

  const editForm = useForm<OperatorLedgerMovementInput>({
    resolver: zodResolver(operatorLedgerMovementSchema) as Resolver<OperatorLedgerMovementInput>,
    defaultValues: makeDefaults('advance'),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  })

  // Sync selected type into form
  useEffect(() => {
    addForm.setValue('entry_type', selectedType)
    if (selectedType !== 'commission') {
      addForm.setValue('commission_percent', null)
    }
  }, [selectedType, addForm])

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

  const onAdd = addForm.handleSubmit(async (v) => {
    await insert.mutateAsync({
      entry_type: selectedType,
      amount: v.amount,
      entry_date: v.entry_date,
      notes: v.notes?.trim() || null,
      service_id: v.service_id || null,
      commission_percent: selectedType === 'commission' ? (v.commission_percent ?? null) : null,
    })
    addForm.reset(makeDefaults(selectedType))
    addForm.clearErrors()
  })

  const serviceSelect = (form: typeof addForm) => (
    <div>
      <label className="field-label">Serviço relacionado (opcional)</label>
      <select
        className="field"
        value={form.watch('service_id') ?? ''}
        onChange={(e) => form.setValue('service_id', e.target.value || null)}
      >
        <option value="">— Nenhum serviço específico —</option>
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
    editForm.clearErrors()
  }

  const closeView = () => setViewingId(null)

  const onEditSubmit = editForm.handleSubmit(async (v) => {
    if (!editingRow) return
    const keepNotes = !editForm.formState.dirtyFields.notes
    const notesPayload = keepNotes ? (editingRow.notes ?? null) : (v.notes?.trim() || null)
    await update.mutateAsync({
      id: editingRow.id,
      payload: {
        entry_type: v.entry_type,
        amount: v.amount,
        entry_date: v.entry_date,
        notes: notesPayload,
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
      aria-label="Editar registro"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeEdit()
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Editar registro</p>
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
                <option value="advance">Adiantamento / Vale</option>
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
                    value={typeof value === 'number' && !Number.isNaN(value) ? value : ''}
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

          {serviceSelect(editForm as unknown as typeof addForm)}

          <div>
            <label className="field-label">Observações</label>
            <textarea
              className="field resize-none"
              rows={3}
              placeholder="Ex.: quinzena fechada"
              {...editForm.register('notes')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <AppButton type="button" variant="secondary" size="sm" onClick={closeEdit} disabled={update.isPending}>
              Cancelar
            </AppButton>
            <AppButton type="submit" size="sm" loading={update.isPending} loadingText="Salvando...">
              Salvar alterações
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  ) : null

  const viewModal = viewOpen ? (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Visualizar lançamento"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeView()
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Lançamento</p>
            <p className="text-xs text-muted-foreground">Visualização do registro (somente leitura).</p>
          </div>
          <AppButton type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeView} aria-label="Fechar">
            <X className="h-4 w-4" />
          </AppButton>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg border border-border bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="font-medium text-foreground">{ENTRY_LABELS[viewingRow.entry_type] ?? viewingRow.entry_type}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="font-medium text-foreground">{dayjs(viewingRow.entry_date).format('DD/MM/YYYY')}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="font-medium text-foreground"><AppMoney value={viewingRow.amount} size="sm" /></p>
          </div>
          <div className="rounded-lg border border-border bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">Serviço</p>
            <p className="font-medium text-foreground">
              {viewingRow.services
                ? `${dayjs(viewingRow.services.service_date).format('DD/MM/YYYY')} · ${viewingRow.services.clients?.name ?? '—'}`
                : '—'}
            </p>
          </div>
          {viewingRow.entry_type === 'commission' && (viewingRow as { commission_percent?: number | null }).commission_percent != null ? (
            <div className="rounded-lg border border-border bg-muted/10 p-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">% (referência)</p>
              <p className="font-medium text-foreground">
                {Number((viewingRow as { commission_percent?: number | null }).commission_percent).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
              </p>
            </div>
          ) : null}
          <div className="rounded-lg border border-border bg-muted/10 p-3 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Observações</p>
            <p className="font-medium text-foreground whitespace-pre-wrap wrap-break-word">{viewingRow.notes || '—'}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <AppButton type="button" variant="secondary" size="sm" onClick={closeView}>
            Fechar
          </AppButton>
          <AppButton
            type="button"
            size="sm"
            onClick={() => {
              setEditingId(viewingRow.id)
              closeView()
            }}
          >
            Editar
          </AppButton>
        </div>
      </div>
    </div>
  ) : null

  return (
    <AppCard className="space-y-5">
      {typeof document !== 'undefined' ? createPortal(editModal, document.body) : null}
      {typeof document !== 'undefined' ? createPortal(viewModal, document.body) : null}

      <div>
        <h2 className="typo-section-title mb-1">Registrar movimentação financeira</h2>
        <p className="typo-body-muted text-sm">
          Registre adiantamentos, pagamentos e comissões do operador. O saldo é calculado automaticamente.
        </p>
      </div>

      {/* Tipo selector */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">O que deseja registrar?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ENTRY_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedType(opt.value)}
                className={cn(
                  'flex flex-col items-start gap-0.5 rounded-lg border-2 px-4 py-3 text-left transition-all',
                  selectedType === opt.value
                    ? 'border-primary bg-primary/8 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onAdd} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Valor *</label>
              <Controller
                name="amount"
                control={addForm.control}
                render={({ field: { onChange, value } }) => (
                  <AppCurrencyInput
                    value={typeof value === 'number' && !Number.isNaN(value) ? value : ''}
                    onValueChange={(v) => onChange(v.floatValue ?? 0)}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              {addForm.formState.errors.amount && (
                <span className="field-error">{addForm.formState.errors.amount.message}</span>
              )}
            </div>
            <div>
              <label className="field-label">Data *</label>
              <input type="date" className="field" {...addForm.register('entry_date')} />
            </div>
          </div>

          {selectedType === 'commission' && (
            <div>
              <label className="field-label">% sobre o frete (referência)</label>
              <Controller
                name="commission_percent"
                control={addForm.control}
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
          )}

          {serviceSelect(addForm)}

          <div>
            <label className="field-label">Observações</label>
            <textarea
              className="field resize-none"
              rows={2}
              placeholder={
                selectedType === 'advance'
                  ? 'Ex.: vale combustível, adiantamento quinzena…'
                  : selectedType === 'payment'
                    ? 'Ex.: pagamento quinzena, fechamento do mês…'
                    : 'Ex.: 10% do frete São Paulo–Campinas…'
              }
              {...addForm.register('notes')}
            />
          </div>

          <AppButton
            type="submit"
            size="md"
            loading={insert.isPending}
            loadingText="Registrando..."
            className="w-full sm:w-auto"
          >
            Registrar {ENTRY_LABELS[selectedType]}
          </AppButton>
        </form>
      </div>

      {/* Histórico */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Histórico de registros</h3>
        {isLoading
          ? <p className="typo-body-muted text-sm">Carregando…</p>
          : !rows?.length
            ? <p className="typo-body-muted text-sm">Nenhum registro ainda.</p>
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
                          <div className="inline-flex items-center gap-2 justify-end">
                            <AppButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => setViewingId(row.id)}
                            >
                              <Eye className="h-4 w-4" />
                              Ver
                            </AppButton>
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </AppCard>
  )
}
