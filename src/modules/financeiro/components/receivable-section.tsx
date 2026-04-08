import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  useReceivablesByService,
  useRegisterPayment,
  useCreateInstallments,
  useCreateDownPaymentAndInstallments,
  useUpdateReceivable,
  useCreateReceivableAtSight,
} from '../hooks/use-financial-queries'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppButton } from '@/shared/components/app/app-button'
import { AppTable, AppTableRow, AppTableCell } from '@/shared/components/app/app-table'
import { AppCurrencyInput, AppDecimalInput } from '@/shared/components/app/app-numeric-input'
import { buildInstallmentsPreview, buildFinancedInstallmentsPreview } from '@/features/create-installments/create-installments'
import { RECEIVABLE_STATUS_LABELS, RECEIVABLE_STATUS_BADGE_VARIANTS } from '@/shared/constants/status'
import dayjs from '@/shared/lib/dayjs'
import { Banknote, DollarSign, Pencil, ChevronRight, ChevronLeft } from 'lucide-react'
import { formatMoneyInputValue, parseMoneyInput } from '@/shared/lib/currency'
import { cn } from '@/shared/lib/cn'
import { AppCard } from '@/shared/components/app/app-card'

interface ReceivableSectionProps {
  serviceId: string
  clientId: string
  suggestedTotal?: number
}

type PaymentMode = null | 'at_sight' | 'installments'
type InstallmentFormMode = 'full' | 'down_payment'

const DEFAULT_INSTALLMENT = {
  mode: 'full' as InstallmentFormMode,
  totalAmount: '',
  downPayment: '',
  downPaymentDate: dayjs().format('YYYY-MM-DD'),
  installmentCount: '1',
  feePercent: '0',
  firstDueDate: dayjs().format('YYYY-MM-DD'),
}

export function ReceivableSection({ serviceId, clientId, suggestedTotal }: ReceivableSectionProps) {
  const { data, isLoading } = useReceivablesByService(serviceId)
  const registerPayment = useRegisterPayment(serviceId)
  const createInstallments = useCreateInstallments(serviceId)
  const createDownPaymentAndInstallments = useCreateDownPaymentAndInstallments(serviceId)
  const createAtSight = useCreateReceivableAtSight(serviceId)
  const updateReceivable = useUpdateReceivable(serviceId)

  // Fluxo único: null = escolha; at_sight = form à vista; installments = form parcelado
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(null)

  // À vista
  const [atSightAmountNum, setAtSightAmountNum] = useState<number | undefined>(undefined)
  const [atSightDate, setAtSightDate] = useState(() => dayjs().format('YYYY-MM-DD'))

  // Parcelado
  const [inst, setInst] = useState(DEFAULT_INSTALLMENT)

  // Pagamento de parcela
  const [payingId, setPayingId] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')

  // Edição de parcela
  const [editId, setEditId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDue, setEditDue] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const totalAmount = parseMoneyInput(inst.totalAmount)
  const downPaymentNum = inst.mode === 'down_payment' ? parseMoneyInput(inst.downPayment) : 0
  const financedAmount = Math.max(0, totalAmount - downPaymentNum)
  const installmentCount = Math.max(1, Number(inst.installmentCount) || 1)
  const feePercent = Number(inst.feePercent) || 0

  const previewFull = useMemo(
    () =>
      inst.mode === 'full' && totalAmount > 0
        ? buildInstallmentsPreview({ totalAmount, installmentCount, feePercent, firstDueDate: inst.firstDueDate })
        : [],
    [inst.mode, totalAmount, installmentCount, feePercent, inst.firstDueDate],
  )

  const previewFinanced = useMemo(
    () =>
      inst.mode === 'down_payment' &&
      totalAmount > 0 &&
      downPaymentNum > 0 &&
      downPaymentNum < totalAmount &&
      financedAmount > 0
        ? buildFinancedInstallmentsPreview({ financedAmount, installmentCount, feePercent, firstDueDate: inst.firstDueDate })
        : [],
    [inst.mode, totalAmount, downPaymentNum, financedAmount, installmentCount, feePercent, inst.firstDueDate],
  )

  const planTotalCount = inst.mode === 'down_payment' ? 1 + installmentCount : installmentCount
  const downPaymentPlanValid =
    inst.mode === 'down_payment' &&
    downPaymentNum > 0 &&
    downPaymentNum < totalAmount &&
    financedAmount > 0 &&
    previewFinanced.length > 0

  const resetFlow = () => {
    setPaymentMode(null)
    setAtSightAmountNum(undefined)
    setAtSightDate(dayjs().format('YYYY-MM-DD'))
    setInst(DEFAULT_INSTALLMENT)
    setPayingId(null)
    setPayAmount('')
    setEditId(null)
  }

  const handleAtSight = async () => {
    const amt = atSightAmountNum
    if (amt == null || !Number.isFinite(amt) || amt <= 0) return
    await createAtSight.mutateAsync({ client_id: clientId, amount: amt, payment_date: atSightDate })
    resetFlow()
  }

  const handleCreateInstallments = async () => {
    if (totalAmount <= 0) return
    if (inst.mode === 'full') {
      if (previewFull.length === 0) return
      await createInstallments.mutateAsync(
        previewFull.map((item) => ({
          service_id: serviceId,
          client_id: clientId,
          installment_number: item.installmentNumber,
          installment_count: installmentCount,
          original_amount: totalAmount / installmentCount,
          fee_percent: feePercent,
          final_amount: item.amount,
          due_date: item.dueDate,
          description: installmentCount > 1 ? `Parcela ${item.installmentNumber}/${installmentCount}` : undefined,
        })),
      )
    } else {
      if (!downPaymentPlanValid) {
        if (downPaymentNum <= 0) { toast.error('Informe o valor da entrada.'); return }
        if (downPaymentNum >= totalAmount) { toast.error('A entrada deve ser menor que o valor total.'); return }
        toast.error('Confira valor total, entrada e número de parcelas.')
        return
      }
      await createDownPaymentAndInstallments.mutateAsync({
        client_id: clientId,
        downPayment: downPaymentNum,
        downPaymentDate: inst.downPaymentDate,
        planTotalCount,
        parcels: previewFinanced.map((item) => ({
          service_id: serviceId,
          client_id: clientId,
          installment_number: item.installmentNumber + 1,
          installment_count: planTotalCount,
          original_amount: financedAmount / installmentCount,
          fee_percent: feePercent,
          final_amount: item.amount,
          due_date: item.dueDate,
          description: planTotalCount > 1 ? `Parcela ${item.installmentNumber + 1}/${planTotalCount}` : undefined,
        })),
      })
    }
    resetFlow()
  }

  const handlePay = async () => {
    if (!payingId || !payAmount) return
    const paid = parseMoneyInput(payAmount)
    if (!Number.isFinite(paid) || paid <= 0) return
    await registerPayment.mutateAsync({
      receivable_id: payingId,
      amount: paid,
      payment_date: dayjs().format('YYYY-MM-DD'),
      payment_method: 'dinheiro',
    })
    setPayingId(null)
    setPayAmount('')
  }

  const openEdit = (rec: NonNullable<typeof data>[number]) => {
    setEditId(rec.id)
    setEditAmount(formatMoneyInputValue(rec.final_amount))
    setEditDue(rec.due_date.slice(0, 10))
    setEditDesc(rec.description ?? '')
    setPayingId(null)
  }

  const handleSaveEdit = async () => {
    if (!editId) return
    const amt = parseMoneyInput(editAmount)
    if (!Number.isFinite(amt) || amt <= 0) return
    await updateReceivable.mutateAsync({
      id: editId,
      payload: { final_amount: amt, original_amount: amt, fee_percent: 0, due_date: editDue, description: editDesc.trim() || null },
    })
    setEditId(null)
  }

  const canEditReceivable = (rec: NonNullable<typeof data>[number]) =>
    rec.paid_amount === 0 && rec.status !== 'paid' && rec.status !== 'cancelled'

  const totalReceivable = data?.reduce((s, r) => s + r.final_amount, 0) ?? 0
  const totalPaid = data?.reduce((s, r) => s + r.paid_amount, 0) ?? 0

  if (isLoading) return <AppLoadingState />

  const hasReceivables = !!data?.length

  return (
    <AppCard className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="typo-section-title">Cobranças ao cliente</h2>
          <p className="typo-caption text-muted-foreground mt-0.5 max-w-md">
            Registre o que o cliente deve pagar — à vista ou parcelado.
          </p>
          {totalReceivable > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              <AppMoney value={totalPaid} size="sm" /> recebido de <AppMoney value={totalReceivable} size="sm" />
            </p>
          )}
        </div>
        {!paymentMode && (
          <AppButton
            variant="primary"
            size="sm"
            onClick={() => setPaymentMode('at_sight')}
            className="flex items-center gap-1.5 shrink-0"
          >
            <Banknote className="h-3.5 w-3.5" />
            Registrar cobrança
          </AppButton>
        )}
      </div>

      {/* FLUXO DE CADASTRO — passo a passo */}
      {paymentMode && (
        <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Passo 1: escolha do tipo (só aparece quando ainda não escolheu installments) */}
          {paymentMode === 'at_sight' && (
            <>
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Como o cliente vai pagar?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('at_sight')}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-lg border-2 px-4 py-3 text-left transition-all',
                      'border-primary bg-primary/8 shadow-sm',
                    )}
                  >
                    <span className="text-sm font-semibold text-foreground">À vista</span>
                    <span className="text-xs text-muted-foreground">Recebeu tudo de uma vez — já pago</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('installments')}
                    className="flex flex-col items-start gap-1 rounded-lg border-2 border-border bg-card px-4 py-3 text-left hover:border-primary/40 transition-all"
                  >
                    <span className="text-sm font-semibold text-foreground">Parcelado</span>
                    <span className="text-xs text-muted-foreground">Dividir em 2 ou mais parcelas</span>
                  </button>
                </div>
              </div>

              {/* Form à vista */}
              <div className="pt-2 border-t border-border space-y-3">
                <p className="text-sm font-medium text-foreground">Valor recebido</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Valor *</label>
                    <AppCurrencyInput
                      value={atSightAmountNum ?? ''}
                      onValueChange={(v) => setAtSightAmountNum(v.floatValue)}
                      placeholder="R$ 0,00"
                    />
                    {suggestedTotal && suggestedTotal > 0 && (atSightAmountNum == null || atSightAmountNum <= 0) && (
                      <button
                        type="button"
                        onClick={() => setAtSightAmountNum(suggestedTotal)}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Usar total apurado (<AppMoney value={suggestedTotal} size="sm" />)
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="field-label">Data do pagamento *</label>
                    <input type="date" className="field" value={atSightDate} onChange={(e) => setAtSightDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <AppButton
                    variant="primary"
                    size="sm"
                    loading={createAtSight.isPending}
                    loadingText="Salvando..."
                    onClick={handleAtSight}
                    disabled={atSightAmountNum == null || atSightAmountNum <= 0}
                  >
                    Confirmar pagamento à vista
                  </AppButton>
                  <AppButton variant="ghost" size="sm" onClick={resetFlow}>Cancelar</AppButton>
                </div>
              </div>
            </>
          )}

          {/* Passo parcelado */}
          {paymentMode === 'installments' && (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('at_sight')}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-3 w-3" /> Voltar
                </button>
                <p className="text-sm font-semibold text-foreground">Dividir em parcelas</p>
              </div>

              <fieldset className="space-y-2 border-0 p-0 m-0">
                <legend className="sr-only">Modo de parcelamento</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'full' as const, label: 'Valor total em parcelas' },
                    { value: 'down_payment' as const, label: 'Entrada + parcelas do saldo' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setInst((i) => ({ ...i, mode: opt.value }))}
                      className={cn(
                        'rounded-lg border-2 px-3 py-2 text-xs font-medium text-left transition-all',
                        inst.mode === opt.value
                          ? 'border-primary bg-primary/8 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="field-label">Valor total *</label>
                  <AppCurrencyInput
                    value={inst.totalAmount}
                    onValueChange={(v) => setInst((i) => ({ ...i, totalAmount: v.value }))}
                    placeholder="R$ 0,00"
                  />
                  {suggestedTotal && suggestedTotal > 0 && parseMoneyInput(inst.totalAmount) === 0 && (
                    <button
                      type="button"
                      onClick={() => setInst((i) => ({ ...i, totalAmount: formatMoneyInputValue(suggestedTotal) }))}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      Usar total apurado (<AppMoney value={suggestedTotal} size="sm" />)
                    </button>
                  )}
                </div>

                {inst.mode === 'down_payment' && (
                  <>
                    <div>
                      <label className="field-label">Valor da entrada *</label>
                      <AppCurrencyInput
                        value={inst.downPayment}
                        onValueChange={(v) => setInst((i) => ({ ...i, downPayment: v.value }))}
                        placeholder="R$ 0,00"
                      />
                    </div>
                    <div>
                      <label className="field-label">Data da entrada *</label>
                      <input
                        type="date"
                        className="field"
                        value={inst.downPaymentDate}
                        onChange={(e) => setInst((i) => ({ ...i, downPaymentDate: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="field-label">{inst.mode === 'down_payment' ? 'Nº parcelas do saldo' : 'Nº de parcelas'}</label>
                  <AppDecimalInput
                    value={inst.installmentCount}
                    onValueChange={(v) => setInst((i) => ({ ...i, installmentCount: v.value }))}
                    placeholder="1"
                    decimalScale={0}
                  />
                </div>
                <div>
                  <label className="field-label">Juros (%)</label>
                  <AppDecimalInput
                    value={inst.feePercent}
                    onValueChange={(v) => setInst((i) => ({ ...i, feePercent: v.value }))}
                    placeholder="0"
                    suffix=" %"
                  />
                </div>
                <div>
                  <label className="field-label">{inst.mode === 'down_payment' ? '1º vencimento (parcelas)' : '1º vencimento'}</label>
                  <input
                    type="date"
                    value={inst.firstDueDate}
                    onChange={(e) => setInst((i) => ({ ...i, firstDueDate: e.target.value }))}
                    className="field"
                  />
                </div>
              </div>

              {inst.mode === 'down_payment' && totalAmount > 0 && downPaymentNum > 0 && downPaymentNum < totalAmount && (
                <p className="text-xs text-muted-foreground">
                  Saldo a financiar: <AppMoney value={financedAmount} size="sm" className="font-medium text-foreground" />
                </p>
              )}

              {inst.mode === 'full' && previewFull.length > 0 && (
                <AppTable
                  columns={[{ header: 'Parcela' }, { header: 'Vencimento' }, { header: 'Valor', align: 'right' }]}
                  footer={
                    <tr>
                      <td colSpan={2} className="px-3 py-1.5 font-semibold text-xs">Total</td>
                      <td className="px-3 py-1.5 text-right font-semibold">
                        <AppMoney value={previewFull.reduce((s, i) => s + i.amount, 0)} size="sm" />
                      </td>
                    </tr>
                  }
                >
                  {previewFull.map((item) => (
                    <AppTableRow key={item.installmentNumber}>
                      <AppTableCell className="text-muted-foreground">{item.installmentNumber}/{installmentCount}</AppTableCell>
                      <AppTableCell>{dayjs(item.dueDate).format('DD/MM/YYYY')}</AppTableCell>
                      <AppTableCell align="right" className="font-medium"><AppMoney value={item.amount} size="sm" /></AppTableCell>
                    </AppTableRow>
                  ))}
                </AppTable>
              )}

              {inst.mode === 'down_payment' && previewFinanced.length > 0 && (
                <AppTable
                  columns={[{ header: 'Item' }, { header: 'Vencimento' }, { header: 'Valor', align: 'right' }]}
                  footer={
                    <tr>
                      <td colSpan={2} className="px-3 py-1.5 font-semibold text-xs">Total a cobrar</td>
                      <td className="px-3 py-1.5 text-right font-semibold">
                        <AppMoney value={downPaymentNum + previewFinanced.reduce((s, i) => s + i.amount, 0)} size="sm" />
                      </td>
                    </tr>
                  }
                >
                  <AppTableRow key="entrada">
                    <AppTableCell>
                      <span className="text-muted-foreground">1/{planTotalCount}</span>
                      {' · '}
                      <span className="font-medium text-foreground">Entrada</span>
                      <AppBadge variant="success" className="ml-2 align-middle">recebida</AppBadge>
                    </AppTableCell>
                    <AppTableCell>{dayjs(inst.downPaymentDate).format('DD/MM/YYYY')}</AppTableCell>
                    <AppTableCell align="right" className="font-medium"><AppMoney value={downPaymentNum} size="sm" /></AppTableCell>
                  </AppTableRow>
                  {previewFinanced.map((item) => (
                    <AppTableRow key={item.installmentNumber}>
                      <AppTableCell className="text-muted-foreground">{item.installmentNumber + 1}/{planTotalCount} · Saldo parcelado</AppTableCell>
                      <AppTableCell>{dayjs(item.dueDate).format('DD/MM/YYYY')}</AppTableCell>
                      <AppTableCell align="right" className="font-medium"><AppMoney value={item.amount} size="sm" /></AppTableCell>
                    </AppTableRow>
                  ))}
                </AppTable>
              )}

              <div className="flex gap-2 pt-1">
                <AppButton
                  variant="primary"
                  size="sm"
                  loading={createInstallments.isPending || createDownPaymentAndInstallments.isPending}
                  loadingText="Salvando..."
                  onClick={handleCreateInstallments}
                  disabled={totalAmount <= 0 || (inst.mode === 'full' ? previewFull.length === 0 : !downPaymentPlanValid)}
                >
                  Salvar parcelas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </AppButton>
                <AppButton variant="ghost" size="sm" onClick={resetFlow}>Cancelar</AppButton>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pagamento de parcela */}
      {payingId && (() => {
        const rec = data?.find((r) => r.id === payingId)
        if (!rec) return null
        const remaining = rec.final_amount - rec.paid_amount
        const inputVal = parseMoneyInput(payAmount)
        return (
          <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-3 animate-in fade-in duration-150">
            <p className="typo-body font-medium">Registrar recebimento</p>
            <p className="text-xs text-muted-foreground">
              Saldo pendente: <strong className="text-foreground"><AppMoney value={remaining} size="sm" /></strong>
            </p>
            <div>
              <label className="field-label">Valor recebido *</label>
              <AppCurrencyInput value={payAmount} onValueChange={(v) => setPayAmount(v.value)} className="field w-full max-w-[200px]" placeholder="R$ 0,00" />
              {inputVal > remaining && <span className="field-hint text-primary">Valor maior que o saldo devedor</span>}
              {inputVal > 0 && inputVal < remaining && <span className="field-hint text-blue-500">Pagamento parcial</span>}
            </div>
            <div className="flex gap-2">
              <AppButton variant="primary" size="sm" loading={registerPayment.isPending} loadingText="Salvando..." onClick={handlePay} disabled={inputVal <= 0}>
                Confirmar recebimento
              </AppButton>
              <AppButton variant="ghost" size="sm" onClick={() => { setPayingId(null); setPayAmount('') }}>Cancelar</AppButton>
            </div>
          </div>
        )
      })()}

      {/* Edição de parcela */}
      {editId && (() => {
        return (
          <div className="rounded-lg border border-primary/25 p-4 bg-primary/5 space-y-3 animate-in fade-in duration-150">
            <p className="typo-body font-medium">Corrigir parcela</p>
            <p className="text-xs text-muted-foreground">Só é possível alterar quando ainda não há pagamento registrado.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="field-label">Valor (R$) *</label>
                <AppCurrencyInput value={editAmount} onValueChange={(v) => setEditAmount(v.value)} className="field" placeholder="R$ 0,00" />
              </div>
              <div>
                <label className="field-label">Vencimento *</label>
                <input type="date" className="field" value={editDue} onChange={(e) => setEditDue(e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <label className="field-label">Descrição</label>
                <input className="field" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <div className="flex gap-2">
              <AppButton variant="primary" size="sm" loading={updateReceivable.isPending} loadingText="..." onClick={handleSaveEdit}>Salvar</AppButton>
              <AppButton variant="ghost" size="sm" onClick={() => setEditId(null)}>Cancelar</AppButton>
            </div>
          </div>
        )
      })()}

      {/* Lista de parcelas */}
      {!hasReceivables ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma cobrança registrada ainda.{' '}
          {!paymentMode && (
            <button
              type="button"
              onClick={() => setPaymentMode('at_sight')}
              className="text-primary font-medium hover:underline"
            >
              Registrar agora
            </button>
          )}
        </p>
      ) : (
        <div className="space-y-2">
          {data!.map((rec) => (
            <div key={rec.id} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
              <DollarSign className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs">{rec.description || `Parcela ${rec.installment_number}/${rec.installment_count}`}</p>
                <p className="text-xs text-muted-foreground">Vence {dayjs(rec.due_date).format('DD/MM/YYYY')}</p>
              </div>
              <AppMoney value={rec.final_amount} size="sm" />
              <AppBadge variant={RECEIVABLE_STATUS_BADGE_VARIANTS[rec.status] ?? 'default'}>
                {RECEIVABLE_STATUS_LABELS[rec.status] ?? rec.status}
              </AppBadge>
              {canEditReceivable(rec) && (
                <button
                  type="button"
                  onClick={() => openEdit(rec)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  <Pencil className="h-3 w-3" />
                  Corrigir
                </button>
              )}
              {rec.status !== 'paid' && rec.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null)
                    setPayingId(rec.id)
                    setPayAmount(formatMoneyInputValue(rec.final_amount - rec.paid_amount))
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap font-medium"
                >
                  Receber
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppCard>
  )
}
