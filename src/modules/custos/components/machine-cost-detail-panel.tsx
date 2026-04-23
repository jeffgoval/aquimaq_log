import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { AppButton } from '@/shared/components/app/app-button'
import { AppMoney } from '@/shared/components/app/app-money'
import { ReceiptPhotoPicker, ReceiptViewButton } from '@/shared/components/receipts'
import { compressImageToJpeg } from '@/shared/lib/image-compress'
import { removeReceiptAtPathIfExists, uploadMachineCostReceipt } from '@/integrations/supabase/receipts-storage'
import { useUpdateMachineCost } from '../hooks/use-cost-queries'
import type { MachineCostWithTractor, Tables, Updates } from '@/integrations/supabase/db-types'
import { parseSupabaseError } from '@/shared/lib/errors'
import dayjs from '@/shared/lib/dayjs'
import { cn } from '@/shared/lib/cn'
import { COST_TYPE_LABELS } from '../lib/cost-type-labels'

type MachineCostRow = Tables<'machine_costs'>

const STATUS_LABELS: Record<NonNullable<MachineCostRow['status']>, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  cancelled: 'Cancelado',
}

const STATUS_OPTIONS: NonNullable<MachineCostRow['status']>[] = ['pending', 'paid', 'cancelled']

export interface MachineCostDetailPanelProps {
  cost: MachineCostWithTractor
  onClose: () => void
  onCostUpdated?: (row: MachineCostRow) => void
}

export const MachineCostDetailPanel = ({ cost, onClose, onCostUpdated }: MachineCostDetailPanelProps) => {
  const updateCost = useUpdateMachineCost()
  const [description, setDescription] = useState(() => cost.description ?? '')
  const [paymentStatus, setPaymentStatus] = useState<MachineCostRow['status']>(() => cost.status)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  useEffect(() => {
    setDescription(cost.description ?? '')
    setPaymentStatus(cost.status)
    setReceiptFile(null)
  }, [cost.id, cost.description, cost.status])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const typeLabel = COST_TYPE_LABELS[cost.cost_type as keyof typeof COST_TYPE_LABELS] ?? cost.cost_type

  const handleSave = async () => {
    const payload: Updates<'machine_costs'> = {}
    const newDesc = description.trim() || null
    if (newDesc !== (cost.description ?? null)) {
      payload.description = newDesc
    }
    if (paymentStatus !== cost.status) {
      payload.status = paymentStatus
    }
    if (receiptFile) {
      try {
        const blob = await compressImageToJpeg(receiptFile)
        if (cost.receipt_storage_path) await removeReceiptAtPathIfExists(cost.receipt_storage_path)
        payload.receipt_storage_path = await uploadMachineCostReceipt(cost.id, blob)
      } catch (e) {
        toast.error(parseSupabaseError(e as Error))
        return
      }
    }
    if (Object.keys(payload).length === 0) {
      onClose()
      return
    }
    const newReceiptPath =
      typeof payload.receipt_storage_path === 'string' ? payload.receipt_storage_path : undefined
    try {
      const updatedRow = await updateCost.mutateAsync({ id: cost.id, payload })
      onCostUpdated?.(updatedRow)
    } catch (e) {
      if (newReceiptPath) void removeReceiptAtPathIfExists(newReceiptPath)
      toast.error(parseSupabaseError(e as Error))
      return
    }
    setReceiptFile(null)
    onClose()
  }

  const dirtyDesc = (description.trim() || null) !== (cost.description ?? null)
  const dirtyReceipt = receiptFile !== null
  const dirtyStatus = paymentStatus !== cost.status
  const canSave = dirtyDesc || dirtyReceipt || dirtyStatus

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="cost-panel-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl',
          'animate-in slide-in-from-right duration-200'
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 shrink-0">
          <div className="min-w-0">
            <h2 id="cost-panel-title" className="typo-section-title truncate">
              {cost.tractors?.name || cost.trucks?.name || cost.log_resources?.name || 'Custo'}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {dayjs(cost.cost_date).format('DD/MM/YYYY')} · {typeLabel}
            </p>
          </div>
          <AppButton type="button" variant="ghost" size="sm" className="shrink-0 h-9 w-9 p-0" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </AppButton>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="typo-caption">Valor</p>
              <p className="font-semibold mt-1">
                <AppMoney value={cost.amount} />
              </p>
            </div>
            <div className="min-w-0">
              <label htmlFor="cost-panel-status" className="typo-caption">
                Situação (pagamento)
              </label>
              <select
                id="cost-panel-status"
                className="field mt-1 w-full"
                value={paymentStatus || ''}
                onChange={(e) => setPaymentStatus(e.target.value as NonNullable<MachineCostRow['status']>)}
                disabled={updateCost.isPending}
              >
                {STATUS_OPTIONS.map((key) => (
                  <option key={key} value={key}>
                    {STATUS_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <p className="typo-caption">Fornecedor</p>
              <p className="font-medium mt-1">{cost.suppliers?.name || cost.supplier_name || '—'}</p>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="cost-panel-desc">
              Observações / detalhe da nota
            </label>
            <textarea
              id="cost-panel-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="field resize-none"
              placeholder="Ex.: litros, número da NF, posto…"
            />
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-medium">Foto da notinha</p>
            {cost.receipt_storage_path ? (
              <div className="flex flex-wrap items-center gap-2">
                <ReceiptViewButton storagePath={cost.receipt_storage_path} variant="secondary" size="sm" />
                <span className="text-xs text-muted-foreground">Anexe outra imagem abaixo para substituir.</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Ainda sem foto. Use o botão abaixo para anexar.</p>
            )}
            <ReceiptPhotoPicker file={receiptFile} onChange={setReceiptFile} disabled={updateCost.isPending} />
          </div>
        </div>

        <div className="border-t border-border p-4 flex flex-wrap gap-2 shrink-0 bg-card/80">
          <AppButton
            type="button"
            variant="primary"
            size="lg"
            disabled={!canSave}
            loading={updateCost.isPending}
            loadingText="Guardando…"
            onClick={handleSave}
          >
            Guardar alterações
          </AppButton>
          <AppButton type="button" variant="ghost" size="md" onClick={onClose}>
            Fechar
          </AppButton>
        </div>
      </div>
    </div>
  )
}
