import { useState, useMemo } from 'react'
import { useReceivablesByService, useRegisterPayment, useCreateInstallments } from '../hooks/use-financial-queries'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppButton } from '@/shared/components/app/app-button'
import { AppTable, AppTableRow, AppTableCell } from '@/shared/components/app/app-table'
import { AppCurrencyInput, AppDecimalInput } from '@/shared/components/app/app-numeric-input'
import { useDisclosure } from '@/shared/hooks/use-disclosure'
import { buildInstallmentsPreview } from '@/features/create-installments/create-installments'
import { RECEIVABLE_STATUS_LABELS, RECEIVABLE_STATUS_BADGE_VARIANTS } from '@/shared/constants/status'
import dayjs from 'dayjs'
import { DollarSign, Plus } from 'lucide-react'

interface ReceivableSectionProps {
  serviceId: string
  clientId: string
  suggestedTotal?: number
}

const DEFAULT_INSTALLMENT = { totalAmount: '', installmentCount: '1', feePercent: '0', firstDueDate: dayjs().format('YYYY-MM-DD') }

export function ReceivableSection({ serviceId, clientId, suggestedTotal }: ReceivableSectionProps) {
  const { data, isLoading } = useReceivablesByService(serviceId)
  const registerPayment = useRegisterPayment(serviceId)
  const createInstallments = useCreateInstallments(serviceId)
  const installmentDialog = useDisclosure()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const payDialog = useDisclosure()
  const [inst, setInst] = useState(DEFAULT_INSTALLMENT)

  const totalAmount = Number(inst.totalAmount) || 0
  const installmentCount = Math.max(1, Number(inst.installmentCount) || 1)
  const feePercent = Number(inst.feePercent) || 0

  const preview = useMemo(() =>
    totalAmount > 0
      ? buildInstallmentsPreview({ totalAmount, installmentCount, feePercent, firstDueDate: inst.firstDueDate })
      : [],
    [totalAmount, installmentCount, feePercent, inst.firstDueDate]
  )

  const handleCreateInstallments = async () => {
    if (totalAmount <= 0) return
    await createInstallments.mutateAsync(
      preview.map(item => ({
        service_id: serviceId,
        client_id: clientId,
        installment_number: item.installmentNumber,
        installment_count: installmentCount,
        original_amount: totalAmount / installmentCount,
        fee_percent: feePercent,
        final_amount: item.amount,
        due_date: item.dueDate,
        description: installmentCount > 1 ? `Parcela ${item.installmentNumber}/${installmentCount}` : undefined,
      }))
    )
    setInst(DEFAULT_INSTALLMENT)
    installmentDialog.close()
  }

  const handlePay = async () => {
    if (!selectedId || !payAmount) return
    await registerPayment.mutateAsync({
      receivable_id: selectedId,
      amount: Number(payAmount),
      payment_date: dayjs().format('YYYY-MM-DD'),
      payment_method: 'dinheiro',
    })
    setPayAmount('')
    setSelectedId(null)
    payDialog.close()
  }

  const totalReceivable = data?.reduce((s, r) => s + r.final_amount, 0) ?? 0
  const totalPaid = data?.reduce((s, r) => s + r.paid_amount, 0) ?? 0

  if (isLoading) return <AppLoadingState />

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold">Parcelamento</h2>
          {totalReceivable > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              <AppMoney value={totalPaid} size="sm" /> recebido de <AppMoney value={totalReceivable} size="sm" />
            </p>
          )}
        </div>
        <AppButton
          variant="primary"
          size="sm"
          onClick={installmentDialog.toggle}
          className="flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />Novo parcelamento
        </AppButton>
      </div>

      {/* Formulário de novo parcelamento */}
      {installmentDialog.isOpen && (
        <div className="rounded-lg border border-border p-4 mb-4 bg-muted/20 space-y-4">
          <p className="text-sm font-medium">Registrar parcelamento</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="field-label">Valor total *</label>
              <AppCurrencyInput
                value={inst.totalAmount}
                onValueChange={v => setInst(i => ({ ...i, totalAmount: v.value }))}
                placeholder="R$ 0,00"
              />
              {suggestedTotal && suggestedTotal > 0 && Number(inst.totalAmount) === 0 && (
                <button
                  type="button"
                  onClick={() => setInst(i => ({ ...i, totalAmount: String(suggestedTotal) }))}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Usar total apurado (<AppMoney value={suggestedTotal} size="sm" />)
                </button>
              )}
            </div>
            <div>
              <label className="field-label">Nº de parcelas</label>
              <AppDecimalInput
                value={inst.installmentCount}
                onValueChange={v => setInst(i => ({ ...i, installmentCount: v.value }))}
                placeholder="1"
                decimalScale={0}
              />
            </div>
            <div>
              <label className="field-label">Juros (%)</label>
              <AppDecimalInput
                value={inst.feePercent}
                onValueChange={v => setInst(i => ({ ...i, feePercent: v.value }))}
                placeholder="0"
                suffix=" %"
              />
            </div>
            <div>
              <label className="field-label">1º vencimento</label>
              <input
                type="date"
                value={inst.firstDueDate}
                onChange={e => setInst(i => ({ ...i, firstDueDate: e.target.value }))}
                className="field"
              />
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <AppTable
              columns={[
                { header: 'Parcela' },
                { header: 'Vencimento' },
                { header: 'Valor', align: 'right' },
              ]}
              footer={
                <tr>
                  <td colSpan={2} className="px-3 py-1.5 font-semibold text-xs">Total</td>
                  <td className="px-3 py-1.5 text-right font-semibold">
                    <AppMoney value={preview.reduce((s, i) => s + i.amount, 0)} size="sm" />
                  </td>
                </tr>
              }
            >
              {preview.map(item => (
                <AppTableRow key={item.installmentNumber}>
                  <AppTableCell className="text-muted-foreground">{item.installmentNumber}/{installmentCount}</AppTableCell>
                  <AppTableCell>{dayjs(item.dueDate).format('DD/MM/YYYY')}</AppTableCell>
                  <AppTableCell align="right" className="font-medium">
                    <AppMoney value={item.amount} size="sm" />
                  </AppTableCell>
                </AppTableRow>
              ))}
            </AppTable>
          )}

          <div className="flex gap-2">
            <AppButton
              variant="primary"
              size="sm"
              loading={createInstallments.isPending}
              loadingText="Salvando..."
              onClick={handleCreateInstallments}
              disabled={totalAmount <= 0}
            >
              Salvar parcelamento
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => { installmentDialog.close(); setInst(DEFAULT_INSTALLMENT) }}
            >
              Cancelar
            </AppButton>
          </div>
        </div>
      )}

      {/* Formulário de pagamento */}
      {payDialog.isOpen && selectedId && (() => {
        const rec = data?.find(r => r.id === selectedId)
        if (!rec) return null
        const remaining = rec.final_amount - rec.paid_amount
        const inputVal = Number(payAmount)
        return (
          <div className="rounded-lg border border-border p-4 mb-4 bg-muted/20 space-y-3">
            <p className="text-sm font-medium">Registrar pagamento</p>
            <p className="text-xs text-muted-foreground">
              Saldo: <strong className="text-foreground"><AppMoney value={remaining} size="sm" /></strong>
            </p>
            <div>
              <label className="field-label">Valor *</label>
              <AppCurrencyInput value={payAmount} onValueChange={v => setPayAmount(v.value)} className="field w-full max-w-[200px]" placeholder="R$ 0,00" />
              {inputVal > remaining && <span className="field-hint text-amber-500">Valor maior que o saldo devedor</span>}
              {inputVal > 0 && inputVal < remaining && <span className="field-hint text-blue-500">Pagamento parcial</span>}
            </div>
            <div className="flex gap-2">
              <AppButton
                variant="primary"
                size="sm"
                loading={registerPayment.isPending}
                loadingText="Salvando..."
                onClick={handlePay}
                disabled={inputVal <= 0}
              >
                Confirmar
              </AppButton>
              <AppButton variant="ghost" size="sm" onClick={payDialog.close}>Cancelar</AppButton>
            </div>
          </div>
        )
      })()}

      {/* Lista de parcelas */}
      {!data?.length
        ? <p className="text-sm text-muted-foreground text-center py-4">Nenhuma parcela. Clique em "Novo parcelamento" para registrar.</p>
        : (
          <div className="space-y-2">
            {data.map(rec => (
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
                {rec.status !== 'paid' && rec.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      setSelectedId(rec.id)
                      setPayAmount(String(rec.final_amount - rec.paid_amount))
                      payDialog.open()
                    }}
                    className="flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap"
                  >
                    <Plus className="h-3 w-3" />Pagar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
